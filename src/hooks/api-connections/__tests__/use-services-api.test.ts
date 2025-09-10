import { renderHook, waitFor, act } from "@testing-library/react";
import { useServicesApi } from "../use-services-api";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/find-workers",
}));

// Mock fetch
global.fetch = jest.fn();

describe.skip("useServicesApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any pending timers before switching back to real timers
    if (jest.isMockFunction(setTimeout)) {
      jest.runOnlyPendingTimers();
    }
    jest.useRealTimers();
  });

  it("should initialize with empty state", async () => {
    // Mock a successful initial response
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 0,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    // Wait for initial load to complete
    // Ensure initial effect completes and state is set
    await waitFor(() => expect(result.current).not.toBeNull());

    expect(result.current.services).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toEqual({
      current_page: 1,
      total_pages: 1,
      total_services: 0,
      per_page: 10,
    });
  }, 15000);

  it("should fetch services successfully", async () => {
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [
        {
          id: "1",
          user_id: "user1",
          title: "Web Development",
          description: "Full stack web development",
          category: "development",
          min_price: 50,
          max_price: 100,
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          freelancer: {
            id: "user1",
            name: "John Doe",
            username: "johndoe",
            email: "john@example.com",
          },
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 1,
        per_page: 10,
      },
    };

    // Clear any previous mocks and set up new one
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      await result.current.searchServices({ page: 1, limit: 10 });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0].name).toBe("John Doe");
      expect(result.current.services[0].title).toBe("Web Development");
      expect(result.current.pagination).toEqual(mockResponse.pagination);
    });
  }, 15000);

  it("should handle API errors", async () => {
    // Clear any previous mocks and set up error response
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch services"),
    );

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      result.current?.searchServices({ page: 1, limit: 10 });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch services");
      expect(result.current.services).toEqual([]);
    });
  }, 15000);

  it("should handle network errors", async () => {
    // Clear any previous mocks
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      result.current?.searchServices({ page: 1, limit: 10 });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.services).toEqual([]);
    });
  }, 15000);

  it("should clear error when clearError is called", async () => {
    // Mock initial successful response
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 0,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    // Wait for initial load to complete with defensive checks
    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).not.toBeNull();
      expect(result.current?.isLoading).toBe(false);
    });

    // Reset fetch mock and trigger an error
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

    await act(async () => {
      if (result.current) {
        await result.current.searchServices({ page: 1, limit: 10 });
      }
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current?.error).toBe("Test error");
    });

    act(() => {
      if (result.current) {
        result.current.clearError();
      }
    });

    expect(result.current?.error).toBeNull();
  }, 15000);

  it("should debounce search requests", async () => {
    jest.useFakeTimers();

    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 0,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    // Wait for initial load to complete
    await waitFor(() => expect(result.current).not.toBeNull());

    // Reset fetch mock count after initial load
    (fetch as jest.Mock).mockClear();

    // Call search multiple times quickly
    act(() => {
      result.current?.searchServices({ keyword: "test" });
      result.current?.searchServices({ keyword: "test2" });
      result.current?.searchServices({ keyword: "test3" });
    });

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it("should update URL with search parameters", async () => {
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 0,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      await result.current?.searchServices({
        keyword: "react",
        category: "development",
        min_price: 50,
        max_price: 100,
        page: 2,
      });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/find-workers?q=react&category=development&min=50&max=100&page=2",
        { scroll: false },
      );
    });
  }, 15000);

  it("should parse URL parameters on initialization", async () => {
    // Set up URL parameters
    mockSearchParams.set("q", "javascript");
    mockSearchParams.set("category", "development");
    mockSearchParams.set("min", "25");
    mockSearchParams.set("max", "75");
    mockSearchParams.set("page", "2");

    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 2,
        total_pages: 1,
        total_services: 0,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    renderHook(() => useServicesApi());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("keyword=javascript"),
        expect.any(Object),
      );
    });
  }, 15000);

  it("should handle pagination correctly", async () => {
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [],
      pagination: {
        current_page: 2,
        total_pages: 5,
        total_services: 50,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      await result.current?.searchServices({ page: 2, limit: 10 });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.pagination).toEqual(mockResponse.pagination);
      expect(result.current.pagination?.current_page).toBe(2);
      expect(result.current.pagination?.total_pages).toBe(5);
    });
  }, 15000);

  it("should map service data to freelancer display format correctly", async () => {
    const mockResponse = {
      success: true,
      message: "Services retrieved successfully",
      data: [
        {
          id: "1",
          user_id: "user1",
          title: "React Developer",
          description: "Expert React development",
          category: "development",
          min_price: 75,
          max_price: 120,
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          freelancer: {
            id: "user1",
            name: "Jane Smith",
            username: "janesmith",
            email: "jane@example.com",
            reputation_score: 85,
          },
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_services: 1,
        per_page: 10,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useServicesApi());

    await act(async () => {
      await result.current?.searchServices({ page: 1, limit: 10 });
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.services).toHaveLength(1);
      const service = result.current.services[0];
      expect(service.name).toBe("Jane Smith");
      expect(service.title).toBe("React Developer");
      expect(service.hourlyRate).toBe(75);
      expect(service.category).toBe("development");
      expect(service.skills).toContain("JavaScript");
      expect(service.skills).toContain("React");
      expect(service.rating).toBeGreaterThan(0);
      expect(service.reviewCount).toBeGreaterThan(0);
    });
  }, 15000);
});
