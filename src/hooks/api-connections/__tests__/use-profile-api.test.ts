/**
 * @jest-environment jsdom
 *
 * Unit tests for useProfileApi hook
 *
 * These tests verify the functionality of the profile API hook including:
 * - Profile fetching
 * - Profile updating
 * - Error handling
 * - Loading states
 * - Helper functions
 */

import { renderHook, act } from "@testing-library/react";
import {
  useProfileApi,
  mapFormDataToUpdateDTO,
  splitName,
  combineName,
} from "../use-profile-api";
import { User, ProfileFormData } from "@/types/user.types";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe("useProfileApi", () => {
  const mockUser: User = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    wallet_address: "0x1234567890abcdef",
    username: "testuser",
    name: "John Doe",
    bio: "Test bio",
    email: "john@example.com",
    is_freelancer: false,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  describe("fetchProfile", () => {
    it("should fetch profile successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "User_fetched_successfully",
          data: mockUser,
        }),
      });

      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile(mockUser.id);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/users/${mockUser.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });

    it("should handle fetch error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          message: "User_not_found",
        }),
      });

      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile(mockUser.id);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual({
        message: "User_not_found",
        code: "USER_NOT_FOUND",
      });
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile(mockUser.id);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.error).toEqual({
        message: "Network error",
        code: "FETCH_ERROR",
      });
    });

    it("should handle missing user ID", async () => {
      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile("");
      });

      expect(result.current.error).toEqual({
        message: "User ID is required",
        code: "MISSING_USER_ID",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      // First set up initial user state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "User_fetched_successfully",
          data: mockUser,
        }),
      });

      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile(mockUser.id);
      });

      // Now test the update
      const updateData = { name: "Jane Doe", bio: "Updated bio" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "User_updated_successfully",
          data: updateData,
        }),
      });

      let updateResult: boolean = false;
      await act(async () => {
        updateResult = await result.current.updateProfile(
          mockUser.id,
          updateData,
        );
      });

      expect(updateResult).toBe(true);
      expect(result.current.user).toEqual({ ...mockUser, ...updateData });
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenLastCalledWith(
        `http://localhost:3000/api/users/${mockUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );
    });

    it("should handle update error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          message: "Invalid_user_ID_format",
        }),
      });

      const { result } = renderHook(() => useProfileApi());

      const updateData = { name: "Jane Doe" };
      let updateResult: boolean = true;

      await act(async () => {
        updateResult = await result.current.updateProfile(
          "invalid-id",
          updateData,
        );
      });

      expect(updateResult).toBe(false);
      expect(result.current.error).toEqual({
        message: "Invalid_user_ID_format",
        code: "UPDATE_ERROR",
      });
    });

    it("should handle missing user ID in update", async () => {
      const { result } = renderHook(() => useProfileApi());

      const updateData = { name: "Jane Doe" };
      let updateResult: boolean = true;

      await act(async () => {
        updateResult = await result.current.updateProfile("", updateData);
      });

      expect(updateResult).toBe(false);
      expect(result.current.error).toEqual({
        message: "User ID is required",
        code: "MISSING_USER_ID",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("clearError", () => {
    it("should clear error state", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      const { result } = renderHook(() => useProfileApi());

      await act(async () => {
        await result.current.fetchProfile(mockUser.id);
      });

      expect(result.current.error).not.toBe(null);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe("loading states", () => {
    it("should set loading to true during fetch", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useProfileApi());

      act(() => {
        result.current.fetchProfile(mockUser.id);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({
            success: true,
            message: "User_fetched_successfully",
            data: mockUser,
          }),
        });
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe("Helper Functions", () => {
  describe("mapFormDataToUpdateDTO", () => {
    it("should map form data correctly", () => {
      const formData: ProfileFormData = {
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        bio: "Test bio",
      };

      const result = mapFormDataToUpdateDTO(formData);

      expect(result).toEqual({
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        bio: "Test bio",
      });
    });

    it("should handle empty strings as undefined", () => {
      const formData: ProfileFormData = {
        name: "",
        username: "johndoe",
        email: "",
        bio: "   ",
      };

      const result = mapFormDataToUpdateDTO(formData);

      expect(result).toEqual({
        name: undefined,
        username: "johndoe",
        email: undefined,
        bio: undefined,
      });
    });
  });

  describe("splitName", () => {
    it("should split full name correctly", () => {
      expect(splitName("John Doe")).toEqual({
        firstName: "John",
        lastName: "Doe",
      });

      expect(splitName("John Michael Doe")).toEqual({
        firstName: "John",
        lastName: "Michael Doe",
      });

      expect(splitName("Madonna")).toEqual({
        firstName: "Madonna",
        lastName: "",
      });
    });

    it("should handle empty or undefined names", () => {
      expect(splitName("")).toEqual({
        firstName: "",
        lastName: "",
      });

      expect(splitName(undefined)).toEqual({
        firstName: "",
        lastName: "",
      });

      expect(splitName("   ")).toEqual({
        firstName: "",
        lastName: "",
      });
    });
  });

  describe("combineName", () => {
    it("should combine names correctly", () => {
      expect(combineName("John", "Doe")).toBe("John Doe");
      expect(combineName("John", "")).toBe("John");
      expect(combineName("", "Doe")).toBe("Doe");
      expect(combineName("", "")).toBe("");
    });

    it("should handle whitespace correctly", () => {
      expect(combineName("  John  ", "  Doe  ")).toBe("John Doe");
      expect(combineName("John", "   ")).toBe("John");
    });
  });
});
