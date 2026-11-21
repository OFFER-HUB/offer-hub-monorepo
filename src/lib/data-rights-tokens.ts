import { createHash, randomBytes } from "node:crypto";

export type DataRightsAction = "export" | "delete";

export const DATA_RIGHTS_TOKEN_TTL_MS = 30 * 60 * 1000;
export const DATA_RIGHTS_TOKENS_TABLE = "data_rights_tokens";

export function generateDataRightsToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashDataRightsToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
