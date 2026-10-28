import { NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/api";
import { getOrderByToken } from "@/lib/orders/store";
import { isOrderToken } from "@/lib/orders/types";

// The token is the random request UUID that only the ordering device holds.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }): Promise<NextResponse> {
  try {
    const { token } = await params;
    if (!isOrderToken(token)) throw new ApiError(404, "ORDER_NOT_FOUND", "We couldn’t find that order.");
    const order = await getOrderByToken(token);
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "We couldn’t find that order.");
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
