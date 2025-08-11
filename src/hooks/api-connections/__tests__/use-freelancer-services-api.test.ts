import { renderHook, act, waitFor } from "@testing-library/react";
import { useFreelancerServicesApi } from "../use-freelancer-services-api";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

describe("useFreelancerServicesApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockService = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Web Development",
    description: "Full-stack web development services",
    category: "development",
    min_price: 50,
    max_price: 100,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockApiResponse = {
    success: true,
    message: "Service created successfully",
    data: mockService,
  };

  describe("fetchUserServices", () => {
    it("should fetch user services successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Services retrieved successfully",
        data: [mockService],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      await act(async () => {
        await result.current.fetchUserServices(
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0].id).toBe(mockService.id);
      expect(result.current.services[0].title).toBe(mockService.title);
      expect(result.current.error).toBeNull();
    });

    it("should handle fetch error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Server error" }),
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      await act(async () => {
        await result.current.fetchUserServices(
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(result.current.error).toBe("Server error");
      expect(result.current.services).toHaveLength(0);
    });

    it("should handle missing user ID", async () => {
      const { result } = renderHook(() => useFreelancerServicesApi());

      await act(async () => {
        await result.current.fetchUserServices("");
      });

      expect(result.current.error).toBe("User ID is required");
    });
  });

  describe("createService", () => {
    it("should create service successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      const serviceData = {
        title: "Web Development",
        description: "Full-stack web development services",
        category: "development",
        min_price: 50,
        max_price: 100,
        currency: "XLM",
      };

      let success = false;
      await act(async () => {
        success = await result.current.createService(
          serviceData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/services",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            title: "Web Development",
            description: "Full-stack web development services",
            category: "development",
            min_price: 50,
            max_price: 100,
          }),
        })
      );
    });

    it("should handle freelancer validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Only freelancers can create services" }),
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      const serviceData = {
        title: "Web Development",
        description: "Full-stack web development services",
        category: "development",
        min_price: 50,
        max_price: 100,
      };

      let success = false;
      await act(async () => {
        success = await result.current.createService(
          serviceData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Only freelancers can create services");
    });

    it("should validate required fields", async () => {
      const { result } = renderHook(() => useFreelancerServicesApi());

      const serviceData = {
        title: "",
        description: "",
        category: "",
        min_price: 50,
        max_price: 100,
      };

      let success = false;
      await act(async () => {
        success = await result.current.createService(
          serviceData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(
        "Title, description, and category are required"
      );
    });

    it("should validate price range", async () => {
      const { result } = renderHook(() => useFreelancerServicesApi());

      const serviceData = {
        title: "Web Development",
        description: "Full-stack web development services",
        category: "development",
        min_price: 100,
        max_price: 50, // Invalid: min > max
      };

      let success = false;
      await act(async () => {
        success = await result.current.createService(
          serviceData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(
        "Invalid price range. Min price must be less than or equal to max price, and both must be positive."
      );
    });
  });

  describe("updateService", () => {
    it("should update service successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      const updateData = {
        title: "Updated Web Development",
        description: "Updated description",
      };

      let success = false;
      await act(async () => {
        success = await result.current.updateService(
          "123e4567-e89b-12d3-a456-426614174000",
          updateData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/services/123e4567-e89b-12d3-a456-426614174000",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Updated Web Development",
            description: "Updated description",
          }),
        })
      );
    });

    it("should handle unauthorized update", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: "You can only update your own services",
        }),
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      const updateData = {
        title: "Updated Web Development",
      };

      let success = false;
      await act(async () => {
        success = await result.current.updateService(
          "123e4567-e89b-12d3-a456-426614174000",
          updateData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(
        "You can only update your own services"
      );
    });
  });

  describe("deleteService", () => {
    it("should delete service successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Service deleted successfully",
        }),
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      let success = false;
      await act(async () => {
        success = await result.current.deleteService(
          "123e4567-e89b-12d3-a456-426614174000",
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/services/123e4567-e89b-12d3-a456-426614174000",
        expect.objectContaining({
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should handle unauthorized deletion", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: "You can only delete your own services",
        }),
      });

      const { result } = renderHook(() => useFreelancerServicesApi());

      let success = false;
      await act(async () => {
        success = await result.current.deleteService(
          "123e4567-e89b-12d3-a456-426614174000",
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(
        "You can only delete your own services"
      );
    });
  });

  describe("clearError", () => {
    it("should clear error state", async () => {
      const { result } = renderHook(() => useFreelancerServicesApi());

      // Set an error first
      await act(async () => {
        await result.current.fetchUserServices("");
      });

      expect(result.current.error).toBe("User ID is required");

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("loading states", () => {
    it("should show correct loading states during operations", async () => {
      const { result } = renderHook(() => useFreelancerServicesApi());

      // Initially all loading states should be false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);

      // Mock a slow response for createService
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockApiResponse,
                }),
              100
            )
          )
      );

      const serviceData = {
        title: "Web Development",
        description: "Full-stack web development services",
        category: "development",
        min_price: 50,
        max_price: 100,
      };

      // Start create operation
      const createPromise = act(async () => {
        return await result.current.createService(
          serviceData,
          "550e8400-e29b-41d4-a716-446655440000"
        );
      });

      // Check that isCreating is true during operation
      expect(result.current.isCreating).toBe(true);

      // Wait for operation to complete
      await createPromise;

      // Check that isCreating is false after operation
      expect(result.current.isCreating).toBe(false);
    });
  });
});
