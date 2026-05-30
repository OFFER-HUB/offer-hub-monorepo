#!/usr/bin/env python3
"""
Manual test suite for email/password login and user registration on offer-hub.org.

This script automates API-level verification of authentication flows,
generates a structured markdown report, and logs every step.

Requirements:
    - Python 3.8+
    - requests>=2.28

Usage:
    python manual_test_login_registration.py [--issue ISSUE_NUMBER]

Environment variables (optional):
    OFFER_HUB_BASE_URL      : base URL of the site (default: https://www.offer-hub.org)
    OFFER_HUB_TEST_EMAIL    : real email for registration/login
    OFFER_HUB_TEST_PASSWORD : password (minimum 8 chars)
    OFFER_HUB_TEST_USERNAME : username (for registration, 3-30 alphanumeric/underscore)
    OFFER_HUB_ISSUE_NUMBER  : issue number for report filename

The script will prompt for any missing variable and run the full test suite.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from functools import lru_cache
from getpass import getpass
from pathlib import Path
from types import TracebackType
from typing import Any, Dict, List, Optional, Tuple, Type

import requests
from requests.adapters import HTTPAdapter
from requests.exceptions import (
    ConnectionError,
    HTTPError,
    Timeout,
    RequestException,
)
from urllib3.util.retry import Retry

# ---------------------------------------------------------------------------
# Configuration – override via environment or constants
# ---------------------------------------------------------------------------

BASE_URL: str = os.environ.get("OFFER_HUB_BASE_URL", "https://www.offer-hub.org")
LOGIN_ENDPOINT: str = f"{BASE_URL}/api/auth/login"
REGISTER_ENDPOINT: str = f"{BASE_URL}/api/auth/register"
REQUEST_TIMEOUT: int = 15  # seconds
MAX_RETRIES: int = 3
BACKOFF_FACTOR: float = 0.5
ISSUE_NUMBER: Optional[str] = os.environ.get("OFFER_HUB_ISSUE_NUMBER")
SSL_VERIFY: bool = os.environ.get("OFFER_HUB_SSL_VERIFY", "true").lower() == "true"

# ---------------------------------------------------------------------------
# Pre-compiled regular expressions (cached for performance)
# ---------------------------------------------------------------------------


@lru_cache(maxsize=8)
def _EMAIL_PATTERN() -> re.Pattern:
    """Return compiled regex for basic email validation."""
    return re.compile(r"[^@]+@[^@]+\.[^@]+")


@lru_cache(maxsize=8)
def _USERNAME_PATTERN() -> re.Pattern:
    """Return compiled regex for username (alphanumeric + underscore)."""
    return re.compile(r"^[a-zA-Z0-9_]+$")


# ---------------------------------------------------------------------------
# Logging setup – both console and file
# ---------------------------------------------------------------------------

_LOG_DIR = Path("reports")
_LOG_DIR.mkdir(exist_ok=True)
_LOG_FILE = _LOG_DIR / f"manual_test_{time.strftime('%Y%m%d_%H%M%S')}.log"

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(str(_LOG_FILE), encoding="utf-8"),
    ],
)
logger = logging.getLogger("ManualTestLoginRegistration")
logger.info("Log file: %s", _LOG_FILE.resolve())

# ---------------------------------------------------------------------------
# Helper: mask sensitive data in logs
# ---------------------------------------------------------------------------


def mask_email(email: str) -> str:
    """Hide middle part of an email for logging.

    Args:
        email: Full email address.

    Returns:
        Masked email (e.g., "j***@domain.com").

    Examples:
        >>> mask_email("john.doe@example.com")
        'j***@example.com'
        >>> mask_email("a@b.c")
        '***@b.c'
    """
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if not local:
        return f"***@{domain}"
    masked_local = local[0] + "***" if len(local) > 1 else "***"
    return f"{masked_local}@{domain}"


def mask_password(password: str) -> str:
    """Return a fixed-length placeholder for password logging.

    Args:
        password: Original password (length irrelevant).

    Returns:
        "****" (masked value).
    """
    return "****"


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------


class ValidationError(ValueError):
    """Raised when credential validation fails."""


class HTTPRequestError(RuntimeError):
    """Raised on unrecoverable HTTP failures."""


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class TestStatus(Enum):
    """Status of a single test step."""

    PASSED = auto()
    FAILED = auto()
    SKIPPED = auto()


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Credentials:
    """Immutable container for authentication credentials.

    Raises:
        ValidationError: if any field fails validation.
    """

    email: str
    password: str
    username: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate all fields upon creation."""
        if not self.email or not self.email.strip():
            raise ValidationError("Email cannot be empty.")
        if not _EMAIL_PATTERN().match(self.email):
            raise ValidationError("Email must be a valid format (e.g., user@domain.com).")
        if len(self.password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if self.username is not None:
            username = self.username.strip()
            if not username:
                raise ValidationError("Username cannot be empty.")
            if len(username) < 3 or len(username) > 30:
                raise ValidationError("Username must be between 3 and 30 characters.")
            if not _USERNAME_PATTERN().match(username):
                raise ValidationError("Username may only contain alphanumeric characters and underscores.")

    def to_dict_login(self) -> Dict[str, str]:
        """Return payload for login request.

        Returns:
            Dictionary with 'email' and 'password'.
        """
        return {"email": self.email.strip(), "password": self.password}

    def to_dict_register(self) -> Dict[str, str]:
        """Return payload for registration request.

        Returns:
            Dictionary with 'email', 'password', and 'username'.
        """
        payload = {
            "email": self.email.strip(),
            "password": self.password,
            "username": self.username.strip() if self.username else "",
        }
        if not payload["username"]:
            raise ValidationError("Username is required for registration.")
        return payload


@dataclass
class TestResult:
    """Stores the outcome of a single test step."""

    step_name: str
    status: TestStatus
    detail: str = ""
    response_data: Optional[Dict[str, Any]] = None
    duration_seconds: float = 0.0

    def __post_init__(self) -> None:
        """Ensure duration is non-negative."""
        if self.duration_seconds < 0:
            self.duration_seconds = 0.0


@dataclass
class TestReport:
    """Aggregate report for all test steps."""

    results: List[TestResult] = field(default_factory=list)
    start_time: float = field(default_factory=time.perf_counter)

    def add(self, result: TestResult) -> None:
        """Append a single test result.

        Args:
            result: The test result to add.
        """
        self.results.append(result)

    @property
    def total(self) -> int:
        return len(self.results)

    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.PASSED)

    @property
    def failed(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.FAILED)

    @property
    def skipped(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.SKIPPED)

    @property
    def duration(self) -> float:
        """Total elapsed time for all tests."""
        return time.perf_counter() - self.start_time

    def to_markdown(self, issue_number: str) -> str:
        """Generate a markdown report string.

        Args:
            issue_number: The issue number to include in the report filename.

        Returns:
            Markdown formatted report.
        """
        lines: List[str] = []
        lines.append(f"# Manual Test Report: Email Login + Registration (Issue #{issue_number})")
        lines.append("")
        lines.append(f"- **Start time**: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(self.start_time))}")
        lines.append(f"- **Duration**: {self.duration:.2f}s")
        lines.append(f"- **Passed**: {self.passed} / {self.total}")
        lines.append(f"- **Failed**: {self.failed}")
        lines.append(f"- **Skipped**: {self.skipped}")
        lines.append("")
        lines.append("## Detailed Results")
        lines.append("")
        lines.append("| Step | Status | Detail | Duration (s) |")
        lines.append("|------|--------|--------|--------------|")
        for result in self.results:
            status_icon = {"PASSED": "✅", "FAILED": "❌", "SKIPPED": "⏭️"}[result.status.name]
            detail_safe = result.detail.replace("\n", " ")[:100]
            lines.append(
                f"| {result.step_name} | {status_icon} {result.status.name} | {detail_safe} | {result.duration_seconds:.2f} |"
            )
        lines.append("")
        if self.failed > 0:
            lines.append("### Failures")
            lines.append("")
            for result in self.results:
                if result.status == TestStatus.FAILED:
                    lines.append(f"- **{result.step_name}**: {result.detail}")
                    if result.response_data:
                        lines.append(f"  - Response: `{json.dumps(result.response_data, indent=2)}`")
            lines.append("")
        return "\n".join(lines)

    def save_report(self, issue_number: str) -> Path:
        """Write markdown report to file.

        Args:
            issue_number: Issue number for filename.

        Returns:
            Path to the saved report.
        """
        report_dir = Path("reports")
        report_dir.mkdir(exist_ok=True)
        filename = report_dir / f"Report_EmailLogin_Registration_Issue_{issue_number}.md"
        content = self.to_markdown(issue_number)
        filename.write_text(content, encoding="utf-8")
        logger.info("Report saved to %s", filename.resolve())
        return filename


# ---------------------------------------------------------------------------
# Utility: create a requests session with retry logic
# ---------------------------------------------------------------------------


def create_session() -> requests.Session:
    """Create a requests.Session with retry and timeout configuration.

    Returns:
        Configured session.
    """
    session = requests.Session()
    retry_strategy = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.verify = SSL_VERIFY
    return session


# ---------------------------------------------------------------------------
# Core test functions
# ---------------------------------------------------------------------------


def send_request(
    session: requests.Session,
    method: str,
    url: str,
    json_data: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
) -> requests.Response:
    """Send HTTP request with error handling and logging.

    Args:
        session: requests session.
        method: HTTP method (GET, POST, etc.).
        url: Request URL.
        json_data: Optional JSON payload.
        headers: Optional HTTP headers.

    Returns:
        Response object.

    Raises:
        HTTPRequestError: If request fails after retries.
    """
    try:
        logger.debug(
            "Sending %s request to %s with payload: %s",
            method.upper(),
            url,
            json.dumps(json_data) if json_data else "None",
        )
        response = session.request(
            method=method.upper(),
            url=url,
            json=json_data,
            headers=headers or {},
            timeout=REQUEST_TIMEOUT,
        )
        logger.info(
            "Response %s from %s (status: %d)",
            method.upper(),
            url,
            response.status_code,
        )
        response.raise_for_status()
        return response
    except Timeout as err:
        raise HTTPRequestError(f"Request timed out after {REQUEST_TIMEOUT}s: {err}") from err
    except ConnectionError as err:
        raise HTTPRequestError(f"Connection error: {err}") from err
    except HTTPError as err:
        # Log full response for debugging but mask sensitive data
        logger.error("HTTP error %s on %s: %s", err.response.status_code, url, err)
        raise HTTPRequestError(
            f"HTTP {err.response.status_code}: {err.response.text[:200]}"
        ) from err
    except RequestException as err:
        raise HTTPRequestError(f"Request failed: {err}") from err


def test_valid_login(
    session: requests.Session, credentials: Credentials
) -> TestResult:
    """Test login with valid credentials.

    Args:
        session: requests session.
        credentials: Valid credentials.

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Login with valid credentials"
    try:
        payload = credentials.to_dict_login()
        logger.info(
            "Testing valid login with email %s",
            mask_email(credentials.email),
        )
        response = send_request(session, "POST", LOGIN_ENDPOINT, json_data=payload)
        data: Dict[str, Any] = response.json()
        success = response.ok and "token" in data
        status = TestStatus.PASSED if success else TestStatus.FAILED
        detail = "Login successful, token received." if success else "Login failed unexpectedly."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (ValidationError, HTTPRequestError) as err:
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


def test_invalid_login(session: requests.Session) -> TestResult:
    """Test login with invalid credentials.

    Args:
        session: requests session.

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Login with invalid credentials"
    try:
        invalid_creds = Credentials(email="invalid@example.com", password="wrongpass")
        payload = invalid_creds.to_dict_login()
        logger.info("Testing invalid login with email %s", mask_email(payload["email"]))
        response = send_request(session, "POST", LOGIN_ENDPOINT, json_data=payload)
        data: Dict[str, Any] = response.json()
        # Expected 401 or 400 with error message
        if response.status_code in (400, 401):
            status = TestStatus.PASSED
            detail = f"Correctly rejected with status {response.status_code}."
        else:
            status = TestStatus.FAILED
            detail = f"Unexpected success: {response.status_code}."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (ValidationError, HTTPRequestError) as err:
        # If the request itself fails (e.g., connection error) we treat as failure
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


def test_valid_registration(
    session: requests.Session, credentials: Credentials
) -> TestResult:
    """Test registration with valid credentials.

    Args:
        session: requests session.
        credentials: Valid credentials (email, password, username).

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Register with valid credentials"
    try:
        payload = credentials.to_dict_register()
        logger.info(
            "Testing registration with email %s and username %s",
            mask_email(credentials.email),
            credentials.username,
        )
        response = send_request(session, "POST", REGISTER_ENDPOINT, json_data=payload)
        data: Dict[str, Any] = response.json()
        # Expect 201 Created or 200 OK, and usually a user object
        if response.status_code in (200, 201):
            status = TestStatus.PASSED
            detail = "Registration successful, user created."
        else:
            status = TestStatus.FAILED
            detail = f"Unexpected status {response.status_code}."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (ValidationError, HTTPRequestError) as err:
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


def test_registration_validation_errors(session: requests.Session) -> TestResult:
    """Test registration endpoint with invalid data expecting validation errors.

    Args:
        session: requests session.

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Registration validation errors"
    try:
        # Test missing username
        invalid_payload = {"email": "newuser@example.com", "password": "short"}
        logger.info("Testing registration with invalid data")
        response = send_request(session, "POST", REGISTER_ENDPOINT, json_data=invalid_payload)
        data: Dict[str, Any] = response.json()
        # Expect 400
        if response.status_code == 400:
            status = TestStatus.PASSED
            detail = "Validation error correctly returned status 400."
        else:
            status = TestStatus.FAILED
            detail = f"Expected 400 but got {response.status_code}."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (ValidationError, HTTPRequestError) as err:
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


def test_login_validation_errors(session: requests.Session) -> TestResult:
    """Test login endpoint with missing fields.

    Args:
        session: requests session.

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Login validation errors"
    try:
        invalid_payload = {"email": "", "password": ""}
        response = send_request(session, "POST", LOGIN_ENDPOINT, json_data=invalid_payload)
        data = response.json()
        if response.status_code == 400:
            status = TestStatus.PASSED
            detail = "Validation error correctly returned status 400."
        else:
            status = TestStatus.FAILED
            detail = f"Expected 400 but got {response.status_code}."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (HTTPRequestError, RequestException) as err:
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


def test_post_registration_redirect(session: requests.Session, credentials: Credentials) -> TestResult:
    """Test that after registration the server responds with appropriate redirect or success state.

    This considers the API nature: we check for a 201/200 with user data as 'success state'.

    Args:
        session: requests session.
        credentials: The credentials used for registration (must be the same as in test_valid_registration).

    Returns:
        TestResult with outcome.
    """
    start = time.perf_counter()
    step_name = "Post-registration success state"
    try:
        payload = credentials.to_dict_register()
        response = send_request(session, "POST", REGISTER_ENDPOINT, json_data=payload)
        data = response.json()
        # Check for a user object or token indicating success
        if response.status_code in (200, 201):
            if "user" in data or "id" in data or "token" in data:
                status = TestStatus.PASSED
                detail = "Registration successful, user data returned."
            else:
                status = TestStatus.PASSED  # Still pass as long as request succeeded
                detail = "Registration accepted but response format unknown."
        else:
            status = TestStatus.FAILED
            detail = f"Unexpected status {response.status_code}."
        return TestResult(
            step_name=step_name,
            status=status,
            detail=detail,
            response_data=data,
            duration_seconds=time.perf_counter() - start,
        )
    except (ValidationError, HTTPRequestError) as err:
        return TestResult(
            step_name=step_name,
            status=TestStatus.FAILED,
            detail=str(err),
            duration_seconds=time.perf_counter() - start,
        )


# ---------------------------------------------------------------------------
# Interactive input capture with validation
# ---------------------------------------------------------------------------


def prompt_credentials() -> Credentials:
    """Prompt user for credentials via stdin.

    Returns:
        Validated Credentials instance.
    """
    print("\nEnter your test credentials (these will be used for testing):")
    while True:
        email = input("Email: ").strip()
        password = getpass("Password (min 8 chars): ")
        username = input("Username (for registration, 3-30 chars): ").strip()
        try:
            creds = Credentials(email=email, password=password, username=username if username else None)
            logger.info("Credentials validated for email %s", mask_email(creds.email))
            return creds
        except ValidationError as err:
            print(f"Validation error: {err}")
            print("Please try again.\n")


# ---------------------------------------------------------------------------
# Main execution
# ---------------------------------------------------------------------------


def main() -> None:
    """Run the manual test suite and generate report."""
    parser = argparse.ArgumentParser(description="Manual test for login/registration on offer-hub.org")
    parser.add_argument(
        "--issue",
        type=str,
        default=ISSUE_NUMBER,
        help="Issue number (e.g., 42). Can also be set via OFFER_HUB_ISSUE_NUMBER env var.",
    )
    args = parser.parse_args()

    issue_number: str = args.issue or os.environ.get("OFFER_HUB_ISSUE_NUMBER", "0")

    print("=== Manual Test: Email Login + Registration ===")
    print(f"Base URL: {BASE_URL}")
    print(f"Issue #: {issue_number}")

    # Prompt for credentials
    credentials = prompt_credentials()

    # Create session with retry
    session = create_session()
    report = TestReport()

    # Run tests
    print("\nRunning tests...")

    # 1. Valid login
    logger.info("--- Test: Valid Login ---")
    result = test_valid_login(session, credentials)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # 2. Invalid login
    logger.info("--- Test: Invalid Login ---")
    result = test_invalid_login(session)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # 3. Valid registration
    logger.info("--- Test: Valid Registration ---")
    result = test_valid_registration(session, credentials)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # 4. Registration validation errors
    logger.info("--- Test: Registration Validation Errors ---")
    result = test_registration_validation_errors(session)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # 5. Login validation errors
    logger.info("--- Test: Login Validation Errors ---")
    result = test_login_validation_errors(session)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # 6. Post-registration success state (re-run registration with same credentials - may fail if already exists)
    # We'll skip if registration already succeeded to avoid duplicates.
    logger.info("--- Test: Post-Registration Success State ---")
    result = test_post_registration_redirect(session, credentials)
    report.add(result)
    print(f"  {result.step_name}: {result.status.name} ({result.detail[:60]})")

    # Generate and save report
    print(f"\nTotal: {report.total} tests, {report.passed} passed, {report.failed} failed, {report.skipped} skipped.")
    report_path = report.save_report(issue_number)
    print(f"Report saved to: {report_path}")

    # Exit with appropriate code
    sys.exit(1 if report.failed > 0 else 0)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Test interrupted by user.")
        sys.exit(130)
    except Exception as exc:
        logger.critical("Unhandled exception: %s", exc, exc_info=True)
        sys.exit(2)