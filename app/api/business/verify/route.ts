import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// POST /api/business/verify - Toggle / Approve Brand Verification (Demo Admin Action)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const brandSessionCookie = cookieStore.get("brand_session");

    let brandIdToVerify: string | null = null;
    let targetVerifiedStatus: boolean | undefined = undefined;

    // Check if body passed brandId or verified status
    try {
      const body = await request.json();
      if (body.brandId) brandIdToVerify = body.brandId;
      if (typeof body.verifiedBadge === "boolean") targetVerifiedStatus = body.verifiedBadge;
    } catch {
      // Body empty, fallback to session brand
    }

    if (!brandIdToVerify && brandSessionCookie) {
      brandIdToVerify = brandSessionCookie.value;
    }

    if (!brandIdToVerify) {
      return NextResponse.json(
        { error: "No active brand session or brandId provided" },
        { status: 401 }
      );
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandIdToVerify },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    const newStatus =
      targetVerifiedStatus !== undefined
        ? targetVerifiedStatus
        : !existingBrand.verifiedBadge;

    const updatedBrand = await prisma.brand.update({
      where: { id: brandIdToVerify },
      data: {
        verifiedBadge: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      brand: {
        id: updatedBrand.id,
        name: updatedBrand.name,
        slug: updatedBrand.slug,
        verifiedBadge: updatedBrand.verifiedBadge,
        accessCode: updatedBrand.accessCode,
      },
      message: newStatus
        ? "⚡️ Brand verified successfully by ROAST ARENA Admin!"
        : "Verification status reset to Pending Review.",
    });
  } catch (error) {
    console.error("Verification endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error updating verification status" },
      { status: 500 }
    );
  }
}
