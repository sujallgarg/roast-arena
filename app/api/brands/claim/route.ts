import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, workEmail, socialHandle, roleDescription } = body;

    if (!workEmail || !socialHandle) {
      return NextResponse.json(
        { error: "Work email and official social handle are required" },
        { status: 400 }
      );
    }

    // Basic domain validation to encourage official work emails
    const emailDomain = workEmail.split("@")[1] || "";
    const isGenericEmail = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"].includes(
      emailDomain.toLowerCase()
    );

    if (isGenericEmail) {
      return NextResponse.json(
        {
          error:
            "Please use your official company domain work email (e.g. alex@swiggy.in) for brand verification.",
        },
        { status: 400 }
      );
    }

    const cleanName = brandName ? brandName.trim() : emailDomain.split(".")[0];
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const handle = socialHandle.startsWith("@") ? socialHandle : `@${socialHandle}`;
    const generatedAccessCode = `${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}2026`;

    // Check if brand already exists or create new brand in pending state
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [{ slug }, { contactEmail: workEmail }],
      },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: cleanName,
          slug,
          handle,
          logoUrl: `https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=150&auto=format&fit=crop&q=80`,
          verifiedBadge: false, // Default to Pending Verification
          brandColor: "#ef4444",
          description: `Registered business entity. Verification pending for ${workEmail}.`,
          website: `https://${emailDomain}`,
          contactEmail: workEmail,
          accessCode: generatedAccessCode,
        },
      });
    }

    // Set brand_session cookie so the user is logged into their pending business portal!
    const cookieStore = await cookies();
    cookieStore.set("brand_session", brand.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    const ticketId = `VERIFY-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      ticketId,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        handle: brand.handle,
        verifiedBadge: brand.verifiedBadge,
        accessCode: brand.accessCode,
        contactEmail: brand.contactEmail,
      },
      message: `Registration submitted! Session created for ${brand.name}. Verification is in progress.`,
    });
  } catch (error) {
    console.error("Error processing brand claim:", error);
    return NextResponse.json(
      { error: "Internal server error processing claim" },
      { status: 500 }
    );
  }
}
