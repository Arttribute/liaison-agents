import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_HONO_API_URL || "http://localhost:3001";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  try {
    const res = await fetch(`${baseUrl}/v1/agents/${agentId}/logs`);
    if (!res.ok) {
      const e = await res.json();
      return NextResponse.json(e, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
