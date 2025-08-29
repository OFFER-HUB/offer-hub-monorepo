import rateLimit from "express-rate-limit";

function createLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "failed",
      error: "Too many requests, please try again later.",
    },
  });
}

export const authLimiter = createLimiter(15 * 60 * 1000, 10); // 15 minutes, 10 requests
