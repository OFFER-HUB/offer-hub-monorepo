import {
  logoutAllUserSessions,
  logoutByRefreshToken,
  logoutCurrentSession,
} from "../auth.service";
import { supabase } from "@/lib/supabase/supabase";

jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/utils/jwt.utils", () => ({
  hashToken: jest.fn(() => "deadbeef"),
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("auth.service logout helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReset();
  });

  describe("logoutAllUserSessions", () => {
    it("should revoke all active sessions for user", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any);

      await expect(logoutAllUserSessions("user-1")).resolves.toEqual({
        message: "Logged out successfully",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("refresh_tokens");
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should throw when db update fails", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({
              error: { message: "db down" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any);

      await expect(logoutAllUserSessions("user-1")).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });

  describe("logoutByRefreshToken", () => {
    it("should revoke matching refresh token", async () => {
      const tokenHashBuf = Buffer.from("deadbeef", "hex");

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({
              data: [{ id: "rt-1", token_hash: tokenHashBuf }],
              error: null,
            }),
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any);

      await expect(logoutByRefreshToken("user-1", "rt_value")).resolves.toEqual({
        message: "Logged out successfully",
      });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should be idempotent if refresh token not found", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const mockUpdate = jest.fn();

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any);

      await expect(logoutByRefreshToken("user-1", "rt_value")).resolves.toEqual({
        message: "Logged out successfully",
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("logoutCurrentSession", () => {
    it("should revoke sessions matching ip and user agent", async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          {
            id: "rt-1",
            device_info: { ip_address: "1.2.3.4", user_agent: "UA" },
          },
          {
            id: "rt-2",
            device_info: { ip_address: "9.9.9.9", user_agent: "Other" },
          },
        ],
        error: null,
      });
      const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIs = jest.fn().mockReturnValue({ gt: mockGt });
      const mockEq2 = jest.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });

      const mockIn = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      const mockUpdate = jest.fn().mockReturnValue({ in: mockIn });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any);

      await expect(
        logoutCurrentSession("user-1", "1.2.3.4", "UA"),
      ).resolves.toEqual({ message: "Logged out successfully" });

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockIn).toHaveBeenCalledWith("id", ["rt-1"]);
    });

    it("should be idempotent when no session matches", async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          {
            id: "rt-1",
            device_info: { ip_address: "9.9.9.9", user_agent: "Other" },
          },
        ],
        error: null,
      });
      const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIs = jest.fn().mockReturnValue({ gt: mockGt });
      const mockEq2 = jest.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });

      const mockUpdate = jest.fn();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any);

      await expect(
        logoutCurrentSession("user-1", "1.2.3.4", "UA"),
      ).resolves.toEqual({ message: "Logged out successfully" });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
