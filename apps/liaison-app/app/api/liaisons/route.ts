import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_NEST_API_BASE_URL;

/**
 * POST /api/liaison
 * Creates a liaison  agent
 */
export async function POST(request: Request) {
  try {
    // const body = await request.json();
    // const res = await fetch(`${baseUrl}/v1/liaison`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(body),
    // });

    // if (!res.ok) {
    //   const errData = await res.json();
    //   return NextResponse.json(errData, { status: res.status });
    // }

    // const data = await res.json();
    // return NextResponse.json(data, { status: res.status });

    // Mock response
    const data = {
      agentId: "0x12345678909990998009809809u",
      name: "Liaison Agent",
      liaisonKey: "12345678901234567891234567891234567892345678901234567893",
      description:
        "A liaison agent that performs onchain actions on behalf of agents",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating liaison agent:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
