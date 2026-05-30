"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteAccountFormProps {
  userEmail?: string;
  onSuccess?: () => void;
}

export function DeleteAccountForm({
  userEmail,
  onSuccess,
}: DeleteAccountFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
          confirmText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete account");
        return;
      }

      // Clear auth token and redirect to homepage
      localStorage.removeItem("auth_token");
      router.push("/");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
        <p className="mt-2 text-sm text-red-700">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        {userEmail && (
          <p className="mt-3 text-xs text-red-600">
            Account:{" "}
            <span className="font-mono font-semibold">{userEmail}</span>
          </p>
        )}
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Continue with Deletion
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Confirm Account Deletion</h3>
          <p className="mt-2 text-sm text-gray-600">
            This will permanently delete your account and all data. This action
            cannot be reversed.
          </p>
        </div>

        <div>
          <label htmlFor="deletePassword" className="block text-sm font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            id="deletePassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="confirmText" className="block text-sm font-medium">
            Type this exactly to confirm:{" "}
            <span className="font-mono font-semibold">DELETE MY ACCOUNT</span>
          </label>
          <input
            type="text"
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            placeholder="DELETE MY ACCOUNT"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            You must type the exact text above to proceed.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setPassword("");
              setConfirmText("");
              setError("");
            }}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || confirmText !== "DELETE MY ACCOUNT"}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
