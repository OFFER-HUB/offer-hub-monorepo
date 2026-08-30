import { buildLlmsIndex } from "@/lib/llms-txt";

export async function GET(): Promise<Response> {
  return new Response(buildLlmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
