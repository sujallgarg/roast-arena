import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("brand_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, brand: null }, { status: 401 });
    }

    let brandId = sessionCookie.value;

    // Check if cookie value is stored as JSON string
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed && parsed.id) {
        brandId = parsed.id;
      }
    } catch {
      // Cookie is raw brand ID string
    }

    if (!brandId) {
      return NextResponse.json({ authenticated: false, brand: null }, { status: 401 });
    }

    // Fetch fresh brand data from database along with active battles
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        battlesAsBrandA: {
          include: {
            brandA: true,
            brandB: true,
            roastPosts: true,
          },
        },
        battlesAsBrandB: {
          include: {
            brandA: true,
            brandB: true,
            roastPosts: true,
          },
        },
        roastPosts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!brand) {
      const res = NextResponse.json({ authenticated: false, brand: null }, { status: 404 });
      res.cookies.delete("brand_session");
      return res;
    }

    const allBattles = [...brand.battlesAsBrandA, ...brand.battlesAsBrandB];

    return NextResponse.json({
      authenticated: true,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        handle: brand.handle,
        logoUrl: brand.logoUrl,
        brandColor: brand.brandColor,
        description: brand.description,
        website: brand.website,
        verifiedBadge: brand.verifiedBadge,
        contactEmail: brand.contactEmail || `${brand.slug}@official.com`,
        accessCode: brand.accessCode,
      },
      battles: allBattles,
      recentRoasts: brand.roastPosts,
    });
  } catch (error) {
    console.error("Error fetching brand session:", error);
    return NextResponse.json(
      { error: "Internal server error fetching session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
  response.cookies.delete("brand_session");
  return response;
}
