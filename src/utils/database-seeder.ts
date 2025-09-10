/**
 * Database seeding utilities for testing and development
 *
 * These utilities are designed for use in tests and development environments
 * to populate the database with realistic test data.
 */

import {
  generateUserData,
  generateContractData,
  generateReviewData,
  SEEDING_CONFIG,
} from "@/lib/seeding/data-generators";

export class DatabaseSeeder {
  private apiUrl: string;

  constructor(apiUrl: string = "http://localhost:3000") {
    this.apiUrl = apiUrl;
  }

  async seedSmallDataset(): Promise<any> {
    return this.seed({ users: 10, dryRun: true });
  }

  async seedMediumDataset(): Promise<any> {
    return this.seed({ users: 30, dryRun: true });
  }

  async seedLargeDataset(): Promise<any> {
    return this.seed({ users: 100, dryRun: true });
  }

  async seedForTesting(): Promise<any> {
    return this.seed({
      users: 20,
      clearExisting: true,
      dryRun: false,
    });
  }

  public async seed(options: {
    users: number;
    clearExisting?: boolean;
    dryRun?: boolean;
  }): Promise<any> {
    const response = await fetch(`${this.apiUrl}/api/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    return response.json();
  }
}

// Helper function for tests and manual database population
export async function populateTestDatabase(options?: {
  users?: number;
  clearExisting?: boolean;
  dryRun?: boolean;
  apiUrl?: string;
}) {
  const seeder = new DatabaseSeeder(options?.apiUrl);

  const result = await seeder.seed({
    users: options?.users || 50,
    clearExisting: options?.clearExisting || false,
    dryRun: options?.dryRun || true,
  });

  console.log("Database population result:", result);
  return result;
}

// Re-export data generators for convenience
export {
  generateUserData,
  generateContractData,
  generateReviewData,
  SEEDING_CONFIG,
};
