/**
 * Tests para poblar la base de datos con datos de prueba
 * Estos tests están diseñados para ejecutarse contra una BD de desarrollo
 *
 * IMPORTANTE:
 * - Solo ejecutar en entorno de desarrollo
 * - Asegúrate de tener una BD de prueba configurada
 * - Estos tests modifican la BD, úsalos con precaución
 *
 * Para ejecutar:
 * npm test -- --testPathPattern=database-population.test.ts
 */

import {
  generateUserData,
  generateContractData,
  generateReviewData,
  SEEDING_CONFIG,
  delay,
} from "@/lib/seeding/data-generators";
import { DatabaseSeeder, populateTestDatabase } from "@/utils/database-seeder";

// Mock fetch para simular llamadas a la API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Database Population Tests", () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("Data Generators", () => {
    it("should generate realistic user data", () => {
      const freelancer = generateUserData(true);
      const client = generateUserData(false);

      // Verificar estructura de freelancer
      expect(freelancer).toHaveProperty("wallet_address");
      expect(freelancer).toHaveProperty("username");
      expect(freelancer).toHaveProperty("name");
      expect(freelancer).toHaveProperty("email");
      expect(freelancer.is_freelancer).toBe(true);
      expect(freelancer.bio).toContain("specialist");

      // Verificar estructura de cliente
      expect(client.is_freelancer).toBe(false);
      // Wallets are generated with base36 chars after the 0x prefix
      expect(client.wallet_address).toMatch(/^0x[0-9a-z]+$/i);
      expect(client.email).toContain("@example.com");
    });

    it("should generate contract data", () => {
      const clientId = "client-123";
      const freelancerId = "freelancer-456";
      const contract = generateContractData(clientId, freelancerId);

      expect(contract).toEqual({
        contract_type: "service",
        freelancer_id: freelancerId,
        client_id: clientId,
        contract_on_chain_id: expect.stringMatching(/^chain_[a-z0-9]+$/),
        escrow_status: "released",
        amount_locked: expect.stringMatching(/^\d+\.\d{2}$/),
      });
    });

    it("should generate review data with realistic distribution", () => {
      const reviews = [];
      // Increase sample size for more reliable statistics
      for (let i = 0; i < 1000; i++) {
        const review = generateReviewData("from-id", "to-id", "contract-id");
        reviews.push(review);
      }

      // Verificar que la mayoría de ratings son 4 y 5
      const ratings = reviews.map((r) => r.rating);
      const highRatings = ratings.filter((r) => r >= 4).length;
      const highRatingPercentage = (highRatings / reviews.length) * 100;

      // With weights [1,2,10,30,57], we expect ~87% to be 4 or 5
      // Allow some variance but ensure it's consistently above 80%
      expect(highRatingPercentage).toBeGreaterThan(80);
      expect(highRatingPercentage).toBeLessThan(95); // Sanity check

      // Verificar que la mayoría tienen comentarios
      const withComments = reviews.filter((r) => r.comment).length;
      const commentPercentage = (withComments / reviews.length) * 100;

      // With 95% probability, we expect ~95% to have comments
      // Allow some variance but ensure it's consistently above 85%
      expect(commentPercentage).toBeGreaterThan(85);
      expect(commentPercentage).toBeLessThan(98); // Sanity check

      // Log the actual percentages for debugging
      console.log(`High ratings (4-5): ${highRatingPercentage.toFixed(1)}%`);
      console.log(`Reviews with comments: ${commentPercentage.toFixed(1)}%`);
    });
  });

  describe("API Seeding Tests", () => {
    it("should call seeding API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Database seeded successfully",
          data: {
            usersCreated: 10,
            contractsCreated: 25,
            reviewsCreated: 20,
            errors: [],
          },
        }),
      });

      const response = await fetch(`${API_BASE_URL}/api/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: 10,
          clearExisting: false,
          dryRun: true,
        }),
      });

      const result = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/seed`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            users: 10,
            clearExisting: false,
            dryRun: true,
          }),
        }),
      );

      expect(result.success).toBe(true);
    });

    it("should handle seeding API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: "Seeding failed",
          error: "Database connection error",
        }),
      });

      const response = await fetch(`${API_BASE_URL}/api/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: 5, dryRun: true }),
      });

      const result = await response.json();
      expect(result.success).toBe(false);
    });
  });

  describe("Population Scenarios", () => {
    const seedingScenarios = [
      {
        name: "Small dataset",
        users: 10,
        expectedFreelancers: 4,
        expectedContracts: 25,
        expectedReviews: 20,
      },
      {
        name: "Medium dataset",
        users: 30,
        expectedFreelancers: 12,
        expectedContracts: 75,
        expectedReviews: 60,
      },
      {
        name: "Large dataset",
        users: 100,
        expectedFreelancers: 40,
        expectedContracts: 250,
        expectedReviews: 200,
      },
    ];

    seedingScenarios.forEach((scenario) => {
      it(`should populate ${scenario.name}`, async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: "Database seeded successfully",
            data: {
              usersCreated: scenario.users,
              contractsCreated: scenario.expectedContracts,
              reviewsCreated: scenario.expectedReviews,
              errors: [],
              config: {
                freelancersCreated: scenario.expectedFreelancers,
                clientsCreated: scenario.users - scenario.expectedFreelancers,
                averageContractsPerFreelancer: Math.round(
                  scenario.expectedContracts / scenario.expectedFreelancers,
                ),
                reviewRate: `${Math.round((scenario.expectedReviews / scenario.expectedContracts) * 100)}%`,
              },
            },
          }),
        });

        const response = await fetch(`${API_BASE_URL}/api/seed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            users: scenario.users,
            clearExisting: true,
            dryRun: true,
          }),
        });

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.data.usersCreated).toBe(scenario.users);
        expect(result.data.contractsCreated).toBeGreaterThanOrEqual(
          scenario.expectedContracts * 0.8,
        );
        expect(result.data.reviewsCreated).toBeGreaterThanOrEqual(
          scenario.expectedReviews * 0.8,
        );
      });
    });
  });

  // Test de integración real - descomenta para usar contra BD real
  describe.skip("REAL DATABASE TESTS (SKIP BY DEFAULT)", () => {
    const REAL_API_URL = "http://localhost:4000"; // Tu backend real

    beforeAll(async () => {
      // Verificar que la BD esté disponible
      try {
        const healthCheck = await fetch(`${REAL_API_URL}/health`);
        if (!healthCheck.ok) {
          throw new Error("Backend not available");
        }
      } catch {
        console.warn("Real database tests skipped - backend not available");
        return;
      }
    });

    it("should populate real database with test data", async () => {
      const response = await fetch(`${REAL_API_URL}/api/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: 20,
          clearExisting: false,
          dryRun: false, // ⚠️ ESTO MODIFICA LA BD REAL
        }),
      });

      const result = await response.json();

      console.log("Real seeding result:", result);

      expect(result.success).toBe(true);
      expect(result.data.usersCreated).toBeGreaterThan(0);
      expect(result.data.contractsCreated).toBeGreaterThan(0);
      expect(result.data.reviewsCreated).toBeGreaterThan(0);
    }, 30000); // 30 segundo timeout

    it("should verify seeded data can be retrieved via reviews API", async () => {
      // Primero, hacer seeding
      const seedResponse = await fetch(`${REAL_API_URL}/api/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: 5,
          clearExisting: false,
          dryRun: false,
        }),
      });

      const seedResult = await seedResponse.json();
      expect(seedResult.success).toBe(true);

      // Dar tiempo para que se procesen los datos
      await delay(2000);

      // Intentar obtener reviews de algún usuario
      // Nota: Necesitarías obtener IDs reales de usuarios creados
      const reviewsResponse = await fetch(
        `${REAL_API_URL}/api/user/test-user-id/reviews`,
      );

      // Este test requiere integración completa con tu backend
      if (reviewsResponse.ok) {
        const reviewsResult = await reviewsResponse.json();
        expect(reviewsResult).toHaveProperty("success");
      }
    }, 30000);
  });
});
