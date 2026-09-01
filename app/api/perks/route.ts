import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const perks = await prisma.perk.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { claims: true },
        },
      },
    });

    const formatted = perks.map((p) => ({
      id: p.id,
      brand: p.brand,
      brandColor: p.brandColor,
      discount: p.discount,
      condition: p.condition,
      xpCost: p.xpCost,
      image: p.image,
      category: p.category,
      code: p.code,
      claimedCount: p.claimedCount || p._count.claims,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, perks: formatted });
  } catch (error) {
    console.error("Error fetching perks from database:", error);
    return NextResponse.json({ success: false, perks: [], error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, discount, condition, xpCost, code, category, brandColor, image } = body;

    if (!brand || !discount || !code) {
      return NextResponse.json(
        { error: "Brand name, discount, and coupon code are required." },
        { status: 400 }
      );
    }

    const newPerk = await prisma.perk.create({
      data: {
        brand: brand.trim(),
        discount: discount.trim(),
        code: code.toUpperCase().trim(),
        xpCost: Number(xpCost) || 500,
        condition: condition?.trim() || "Valid on battle redemption",
        category: category || "shopping",
        brandColor: brandColor || "bg-red-600",
        image:
          image?.trim() ||
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80",
        claimedCount: 0,
      },
    });

    return NextResponse.json({ success: true, perk: newPerk });
  } catch (error) {
    console.error("Error creating perk in database:", error);
    return NextResponse.json(
      { error: "Failed to create perk in database" },
      { status: 500 }
    );
  }
}
