import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, email, accessCode } = body;

    let brand = null;

    // 1. Login by brandId or slug
    if (brandId) {
      brand = await prisma.brand.findFirst({
        where: {
          OR: [{ id: brandId }, { slug: brandId.toLowerCase() }],
        },
      });
    }

    // 2. Login by email / access code
    if (!brand && email) {
      const formattedEmail = email.trim().toLowerCase();
      const domainPart = formattedEmail.split("@")[1]?.split(".")[0];

      brand = await prisma.brand.findFirst({
        where: {
          OR: [
            { contactEmail: formattedEmail },
            ...(domainPart ? [{ slug: domainPart }] : []),
          ],
        },
      });

      if (brand && brand.accessCode && accessCode) {
        if (brand.accessCode.toUpperCase() !== accessCode.trim().toUpperCase()) {
          return NextResponse.json(
            { error: "Invalid access code for this brand domain." },
            { status: 401 }
          );
        }
      }
    }

    if (!brand) {
      return NextResponse.json(
        {
          error:
            "Brand account not found. Please select a brand from the demo list or verify your corporate email.",
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${brand.name}!`,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        handle: brand.handle,
        logoUrl: brand.logoUrl,
        brandColor: brand.brandColor,
        verifiedBadge: brand.verifiedBadge,
        contactEmail: brand.contactEmail || `${brand.slug}@official.com`,
      },
    });

    const sessionValue = JSON.stringify({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      handle: brand.handle,
      logoUrl: brand.logoUrl,
      brandColor: brand.brandColor,
    });

    response.cookies.set("brand_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error logging in business brand:", error);
    return NextResponse.json(
      { error: "Internal server error during business login." },
      { status: 500 }
    );
  }
}
