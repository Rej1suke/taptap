import { NextResponse } from "next/server";
import { errorResponse, readBody, requireSameOrigin } from "@/lib/api";
import { parseCreateOrder } from "@/lib/orders/validation";
import { placeOrder } from "@/lib/orders/store";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    requireSameOrigin(request);
    const input = parseCreateOrder(await readBody(request));
    const order = await placeOrder(input);
    return NextResponse.json({ order }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
