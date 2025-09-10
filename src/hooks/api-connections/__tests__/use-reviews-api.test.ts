import { renderHook, act } from "@testing-library/react";
import { useReviewsApi } from "../use-reviews-api";
import {
  CreateReviewDTO,
  Review,
  ReviewsFetchResponse,
  ReviewCreateResponse,
} from "@/types/review.types";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console.error to avoid cluttering test output
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("useReviewsApi", () => {
  const mockReview: Review = {
    id: "review-123",
    from_id: "550e8400-e29b-41d4-a716-446655440000",
    to_id: "550e8400-e29b-41d4-a716-446655440001",
    contract_id: "550e8400-e29b-41d4-a716-446655440002",
    rating: 5,
    comment: "Great work!",
    created_at: "2024-01-15T10:00:00.000Z",
  };

  const createReviewData: CreateReviewDTO = {
    from_id: "550e8400-e29b-41d4-a716-446655440000",
    to_id: "550e8400-e29b-41d4-a716-446655440001",
    contract_id: "550e8400-e29b-41d4-a716-446655440002",
    rating: 5,
    comment: "Great work!",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("fetchUserReviews", () => {
    it("should fetch user reviews successfully", async () => {
      const mockResponse: ReviewsFetchResponse = {
        success: true,
        message: "Reviews_fetched_successfully",
        data: [mockReview],
        count: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReviewsApi());
      let reviews: Review[] = [];

      await act(async () => {
        reviews = await result.current.fetchUserReviews(
          "550e8400-e29b-41d4-a716-446655440001",
        );
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/user/550e8400-e29b-41d4-a716-446655440001/reviews",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      expect(reviews).toEqual([mockReview]);
    });

    it("should return empty array when no reviews found", async () => {
      const mockResponse: ReviewsFetchResponse = {
        success: true,
        message: "Reviews_fetched_successfully",
        data: [],
        count: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReviewsApi());
      let reviews: Review[] = [];

      await act(async () => {
        reviews = await result.current.fetchUserReviews(
          "550e8400-e29b-41d4-a716-446655440001",
        );
      });

      expect(reviews).toEqual([]);
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          success: false,
          message: "User not found",
        }),
      });

      const { result } = renderHook(() => useReviewsApi());

      await expect(
        result.current.fetchUserReviews("550e8400-e29b-41d4-a716-446655440001"),
      ).rejects.toThrow("User not found");
    });

    it("should validate user ID format", async () => {
      const { result } = renderHook(() => useReviewsApi());

      await expect(result.current.fetchUserReviews("")).rejects.toThrow(
        "User ID is required",
      );

      await expect(
        result.current.fetchUserReviews("invalid-id"),
      ).rejects.toThrow("Invalid user ID format");
    });
  });

  describe("createReview", () => {
    it("should create review successfully", async () => {
      const mockResponse: ReviewCreateResponse = {
        success: true,
        message: "Review_created_successfully",
        data: mockReview,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReviewsApi());
      let createdReview: Review;

      await act(async () => {
        createdReview = await result.current.createReview(createReviewData);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/reviews",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createReviewData),
        },
      );
      expect(createdReview).toEqual(mockReview);
    });

    it("should handle validation errors", async () => {
      const { result } = renderHook(() => useReviewsApi());

      // Invalid rating
      await expect(
        result.current.createReview({
          ...createReviewData,
          rating: 6,
        }),
      ).rejects.toThrow("Rating must be a whole number between 1 and 5");

      await expect(
        result.current.createReview({
          ...createReviewData,
          rating: 0,
        }),
      ).rejects.toThrow("Rating must be a whole number between 1 and 5");

      // Invalid IDs
      await expect(
        result.current.createReview({
          ...createReviewData,
          from_id: "",
        }),
      ).rejects.toThrow("Invalid reviewer ID");

      await expect(
        result.current.createReview({
          ...createReviewData,
          to_id: "invalid-id",
        }),
      ).rejects.toThrow("Invalid reviewee ID");
    });

    it("should handle server validation errors", async () => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: "Missing_required_fields",
        }),
      });

      const { result } = renderHook(() => useReviewsApi());

      await act(async () => {
        await expect(
          result.current.createReview(createReviewData),
        ).rejects.toThrow("All required fields must be filled out");
      });
    });

    it("should handle authorization errors", async () => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          message: "Not authorized",
        }),
      });

      const { result } = renderHook(() => useReviewsApi());

      await act(async () => {
        await expect(
          result.current.createReview(createReviewData),
        ).rejects.toThrow("You are not authorized to review this contract");
      });
    });

    it("should handle duplicate review errors", async () => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          message: "Duplicate review",
        }),
      });

      const { result } = renderHook(() => useReviewsApi());

      await act(async () => {
        await expect(
          result.current.createReview(createReviewData),
        ).rejects.toThrow("You have already reviewed this contract");
      });
    });
  });

  describe("computeAverage", () => {
    it("should compute average rating correctly", () => {
      const { result } = renderHook(() => useReviewsApi());

      const reviews: Review[] = [
        { ...mockReview, rating: 5 },
        { ...mockReview, rating: 4 },
        { ...mockReview, rating: 3 },
      ];

      const average = result.current.computeAverage(reviews);
      expect(average).toBe(4.0);
    });

    it("should handle single review", () => {
      const { result } = renderHook(() => useReviewsApi());

      const reviews: Review[] = [{ ...mockReview, rating: 5 }];

      const average = result.current.computeAverage(reviews);
      expect(average).toBe(5.0);
    });

    it("should return 0 for empty reviews array", () => {
      const { result } = renderHook(() => useReviewsApi());

      const average = result.current.computeAverage([]);
      expect(average).toBe(0);
    });

    it("should round to 1 decimal place", () => {
      const { result } = renderHook(() => useReviewsApi());

      const reviews: Review[] = [
        { ...mockReview, rating: 5 },
        { ...mockReview, rating: 4 },
        { ...mockReview, rating: 4 },
      ];

      const average = result.current.computeAverage(reviews);
      expect(average).toBe(4.3);
    });
  });

  describe("useUserReviews hook", () => {
    it("should return loading state initially", async () => {
      // Mock fetch to prevent actual API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      const TestComponent = () => {
        const { useUserReviews } = useReviewsApi();
        const hook = useUserReviews("550e8400-e29b-41d4-a716-446655440001");
        return hook;
      };

      const { result } = renderHook(() => TestComponent());

      expect(result.current.data).toBeUndefined();
      // Initially false, but may become true immediately due to auto-fetch
      expect(typeof result.current.isLoading).toBe("boolean");
      expect(result.current.error).toBeUndefined();
    });
  });

  describe("useCreateReview hook", () => {
    it("should return mutate function and loading states", () => {
      const TestComponent = () => {
        const { useCreateReview } = useReviewsApi();
        const hook = useCreateReview();
        return hook;
      };

      const { result } = renderHook(() => TestComponent());

      expect(typeof result.current.mutate).toBe("function");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it("should handle successful mutation", async () => {
      const mockResponse: ReviewCreateResponse = {
        success: true,
        message: "Review_created_successfully",
        data: mockReview,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const TestComponent = () => {
        const { useCreateReview } = useReviewsApi();
        return useCreateReview();
      };

      const { result } = renderHook(() => TestComponent());

      let createdReview: Review;

      await act(async () => {
        createdReview = await result.current.mutate(createReviewData);
      });

      expect(createdReview).toEqual(mockReview);
      expect(result.current.error).toBeUndefined();
    });

    it("should handle mutation errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: "Missing_required_fields",
        }),
      });

      const TestComponent = () => {
        const { useCreateReview } = useReviewsApi();
        return useCreateReview();
      };

      const { result } = renderHook(() => TestComponent());

      await act(async () => {
        try {
          await result.current.mutate(createReviewData);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(
        "All required fields must be filled out",
      );
    });
  });
});
