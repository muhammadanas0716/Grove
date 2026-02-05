import { NextRequest, NextResponse } from "next/server";

const POLAR_CHECKOUT_LINK = "https://buy.polar.sh/polar_cl_JdyE5Amtd1QCPvZSXazJl81VdlCbu4qYkbEqB0QdtX7";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customer_id");

  let checkoutUrl = POLAR_CHECKOUT_LINK;

  if (customerId) {
    checkoutUrl = `${POLAR_CHECKOUT_LINK}?customer_id=${customerId}`;
  }

  return NextResponse.redirect(checkoutUrl, { status: 307 });
}

export const dynamic = "force-dynamic";
