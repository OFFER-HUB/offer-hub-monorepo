const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Set environment variables
process.env.JWT_SECRET =
  "your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security";
process.env.JWT_EXPIRES_IN = "24h";
process.env.PORT = "4000";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple JWT utilities for testing
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

// Simple authentication middleware
function authenticateToken(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "NO_TOKEN",
        message: "Authentication required. Please provide a valid token.",
      },
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Mock user data
    req.user = {
      id: decoded.user_id,
      role: decoded.role || "client",
      wallet_address: "test-wallet-address",
      username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
}

// Simple role authorization middleware
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_USER",
          message: "Authentication required",
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Access denied. Required roles: ${roles.join(", ")}`,
        },
      });
    }

    next();
  };
}

// Test routes
app.get("/", (req, res) => {
  res.json({
    message: "💼 OFFER-HUB backend is up and running!",
    timestamp: new Date().toISOString(),
    status: "healthy",
    endpoints: {
      public: ["/api/health", "/api/generate-token"],
      protected: ["/api/protected", "/api/admin", "/api/client-only"],
    },
  });
});

// Public route (no authentication required)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Generate test token endpoint
app.post("/api/generate-token", (req, res) => {
  const { role = "client", user_id = "test-user-123" } = req.body;

  const token = signAccessToken({
    user_id,
    role,
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user_id,
        role,
      },
    },
    message: "Token generated successfully",
  });
});

// Protected route (authentication required)
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Access granted to protected route",
    data: {
      user: req.user,
      timestamp: new Date().toISOString(),
    },
  });
});

// Admin only route
app.get(
  "/api/admin",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
      data: {
        user: req.user,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

// Client only route
app.get(
  "/api/client-only",
  authenticateToken,
  authorizeRoles("client"),
  (req, res) => {
    res.json({
      success: true,
      message: "Client access granted",
      data: {
        user: req.user,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

// Test authentication endpoint
app.post("/api/test-auth", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "NO_TOKEN",
        message: "No token provided",
      },
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    res.json({
      success: true,
      message: "Token is valid",
      data: {
        decoded,
        token: token.substring(0, 20) + "...",
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 OFFER-HUB test server is live at http://localhost:${port}`);
  console.log("🌐 Testing authentication middleware...");
  console.log("📋 Available endpoints:");
  console.log("  GET  / - Health check");
  console.log("  GET  /api/health - Public health endpoint");
  console.log("  POST /api/generate-token - Generate test token");
  console.log("  GET  /api/protected - Protected endpoint (requires auth)");
  console.log("  GET  /api/admin - Admin endpoint (requires admin role)");
  console.log(
    "  GET  /api/client-only - Client endpoint (requires client role)",
  );
  console.log("  POST /api/test-auth - Test authentication");
  console.log("");
  console.log("🧪 Test commands:");
  console.log("  # Generate token:");
  console.log(
    '  Invoke-WebRequest -Uri "http://localhost:4000/api/generate-token" -Method POST -ContentType "application/json" -Body \'{"role":"admin"}\'',
  );
  console.log("");
  console.log("  # Test protected endpoint:");
  console.log(
    '  Invoke-WebRequest -Uri "http://localhost:4000/api/protected" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}',
  );
});
