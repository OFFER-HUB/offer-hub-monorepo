import { NextRequest, NextResponse } from "next/server";
import { handleDataRightsRequest } from "@/lib/data-rights-request";

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleDataRightsRequest(req, "delete");
}
