import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ReviewModal from "../review-modal";
import { Review } from "@/types/review.types";

// Mock the hooks and components
jest.mock("@/hooks/api-connections/use-reviews-api", () => ({
  useReviewsApi: () => ({
    useCreateReview: () => mockUseCreateReview,
  }),
}));

jest.mock("@/lib/contexts/NotificatonContext", () => ({
  useNotification: () => ({
    actions: {
      addNotification: mockAddNotification,
    },
  }),
}));

jest.mock("@/components/ui/star-rating", () => {
  return function MockStarRating({
    rating,
    interactive,
    value,
    onChange,
  }: any) {
    if (interactive && onChange) {
      return (
        <div data-testid="interactive-star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              data-testid={`star-${star}`}
              onClick={() => onChange(star)}
              className={value >= star ? "active" : ""}
            >
              ★
            </button>
          ))}
        </div>
      );
    }
    return <div data-testid="star-rating">Rating: {rating}</div>;
  };
});

const mockUseCreateReview = {
  mutate: jest.fn(),
  isLoading: false,
  error: undefined as string | undefined,
};

const mockAddNotification = jest.fn();
const mockOnClose = jest.fn();
const mockOnCreated = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  contractId: "contract-123",
  fromId: "user-from-456",
  toId: "user-to-789",
  onCreated: mockOnCreated,
};

describe("ReviewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateReview.mutate.mockReset();
    mockUseCreateReview.isLoading = false;
    mockUseCreateReview.error = undefined;
  });

  it("should render modal when isOpen is true", () => {
    render(<ReviewModal {...defaultProps} />);

    expect(screen.getByText("Leave a Review")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("Comment (Optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should not render modal when isOpen is false", () => {
    render(<ReviewModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Leave a Review")).not.toBeInTheDocument();
  });

  it("should close modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: "" }); // Close button has no text
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should close modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should update rating when star is clicked", async () => {
    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    const star4 = screen.getByTestId("star-4");
    await user.click(star4);

    // Check that the submit button is enabled now
    const submitButton = screen.getByRole("button", { name: /submit review/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("should update comment when textarea is typed in", async () => {
    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    await user.type(textarea, "Great work!");

    expect(textarea).toHaveValue("Great work!");
  });

  it("should show character count for comment", async () => {
    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    await user.type(textarea, "Test comment");

    expect(screen.getByText("12/500 characters")).toBeInTheDocument();
  });

  it("should show validation error when submitting without rating", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReviewModal {...defaultProps} />);

    // The submit button is disabled with no rating. Submit the form directly.
    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(screen.getByText("Please select a rating")).toBeInTheDocument();
  });

  it("should submit review successfully", async () => {
    const user = userEvent.setup();
    const mockReview: Review = {
      id: "review-123",
      from_id: "user-from-456",
      to_id: "user-to-789",
      contract_id: "contract-123",
      rating: 5,
      comment: "Excellent work!",
      created_at: "2024-01-15T10:00:00.000Z",
    };

    mockUseCreateReview.mutate.mockResolvedValueOnce(mockReview);

    render(<ReviewModal {...defaultProps} />);

    // Set rating
    const star5 = screen.getByTestId("star-5");
    await user.click(star5);

    // Add comment
    const textarea = screen.getByPlaceholderText(/share your experience/i);
    await user.type(textarea, "Excellent work!");

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUseCreateReview.mutate).toHaveBeenCalledWith({
        from_id: "user-from-456",
        to_id: "user-to-789",
        contract_id: "contract-123",
        rating: 5,
        comment: "Excellent work!",
      });
    });

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        title: "Review Submitted",
        message: "Your review has been submitted successfully!",
      }),
    );

    expect(mockOnCreated).toHaveBeenCalledWith(mockReview);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should show loading state when submitting", async () => {
    mockUseCreateReview.isLoading = true;
    mockUseCreateReview.mutate.mockImplementation(() => new Promise(() => {})); // Never resolves

    const user = userEvent.setup();
    render(<ReviewModal {...defaultProps} />);

    // Set rating
    const star3 = screen.getByTestId("star-3");
    await user.click(star3);

    // Submit
    const submitButton = screen.getByRole("button", { name: /submitting/i });
    await user.click(submitButton);

    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should show API error message", () => {
    mockUseCreateReview.error = "You have already reviewed this contract";

    render(<ReviewModal {...defaultProps} />);

    expect(
      screen.getByText("You have already reviewed this contract"),
    ).toBeInTheDocument();
  });

  it("should disable submit button when no rating is selected", () => {
    render(<ReviewModal {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it("should reset form when modal is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReviewModal {...defaultProps} />);

    // Set rating and comment
    const star4 = screen.getByTestId("star-4");
    await user.click(star4);

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    await user.type(textarea, "Test comment");

    // Close modal
    rerender(<ReviewModal {...defaultProps} isOpen={false} />);

    // Reopen modal
    rerender(<ReviewModal {...defaultProps} isOpen={true} />);

    // Check that form is reset
    const newTextarea = screen.getByPlaceholderText(/share your experience/i);
    expect(newTextarea).toHaveValue("");

    const submitButton = screen.getByRole("button", { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it("should handle submit without comment", async () => {
    const user = userEvent.setup();
    const mockReview: Review = {
      id: "review-123",
      from_id: "user-from-456",
      to_id: "user-to-789",
      contract_id: "contract-123",
      rating: 4,
      created_at: "2024-01-15T10:00:00.000Z",
    };

    mockUseCreateReview.mutate.mockResolvedValueOnce(mockReview);

    render(<ReviewModal {...defaultProps} />);

    // Set rating only (no comment)
    const star4 = screen.getByTestId("star-4");
    await user.click(star4);

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUseCreateReview.mutate).toHaveBeenCalledWith({
        from_id: "user-from-456",
        to_id: "user-to-789",
        contract_id: "contract-123",
        rating: 4,
        comment: undefined,
      });
    });
  });
});
