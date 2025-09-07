import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql/schema';
import serviceRequestRoutes from "@/routes/service-request.routes";
import { reviewRoutes } from "./routes/review.routes";
import serviceRoutes from "@/routes/service.routes";
import applicationRoutes from "@/routes/application.routes";
import nftRoutes from "@/routes/nft.routes";
import contractRoutes from "@/routes/contract.routes";
import projectRoutes from "@/routes/project.routes";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import { errorHandlerMiddleware, setupGlobalErrorHandlers } from "./middlewares/errorHandler.middleware";

import conversationRoutes from "@/routes/conversation.routes";
import messageRoutes from "@/routes/message.routes";

// Setup global error handlers for uncaught exceptions and unhandled rejections
setupGlobalErrorHandlers();

const app: Application = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const isProd = process.env.NODE_ENV === 'production';
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: !isProd,
  context: ({ req }) => ({ req }),
});

// Routes
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/nfts-awarded", nftRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (_req, res) => {
  res.send("💼 OFFER-HUB backend is up and running!");
});

// Use the new error handling middleware
app.use(errorHandlerMiddleware);

// Start Apollo Server and Express server
async function startServer() {
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  app.listen(port, () => {
    console.log(`🚀 OFFER-HUB server is live at http://localhost:${port}`);
    console.log(`GraphQL endpoint available at http://localhost:${port}${server.graphqlPath}`);
    console.log(`GraphQL Playground available at http://localhost:${port}${server.graphqlPath}`);
    console.log("🌐 Connecting freelancers and clients around the world...");
    console.log("⚡ Working...");
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});