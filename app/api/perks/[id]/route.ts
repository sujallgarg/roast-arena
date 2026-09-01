import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { brand, discount, condition, xpCost, code, category, brandColor, image, isActive } = body;

    const updated = await prisma.perk.update({
      where: { id },
      data: {
        ...(brand && { brand: brand.trim() }),
        ...(discount && { discount: discount.trim() }),
        ...(code && { code: code.toUpperCase().trim() }),
        ...(xpCost !== undefined && { xpCost: Number(xpCost) }),
        ...(condition !== undefined && { condition: condition.trim() }),
        ...(category && { category }),
        ...(brandColor && { brandColor }),
        ...(image && { image: image.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, perk: updated });
  } catch (error) {
    console.error("Error updating perk in database:", error);
    return NextResponse.json({ error: "Failed to update perk" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.perk.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Perk deleted from database." });
  } catch (error) {
    console.error("Error deleting perk from database:", error);
    return NextResponse.json({ error: "Failed to delete perk from database" }, { status: 500 });
  }
}
