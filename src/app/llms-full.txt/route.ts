import { buildLlmsFull } from "@/lib/llms-txt";

export async function GET(): Promise<Response> {
  return new Response(buildLlmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
