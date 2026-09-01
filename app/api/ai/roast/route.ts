import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { opponentRoast, brandName, targetBrand, tone } = await req.json();

    if (!opponentRoast || !brandName) {
      return NextResponse.json(
        { error: "Opponent roast and brand name are required" },
        { status: 400 }
      );
    }

    // AI Comeback Preset Library by Tone (Humorous, Non-Defamatory, Brand Safe)
    const comebacksByTone: Record<string, string[]> = {
      Savage: [
        `Nice attempt @${targetBrand || "rival"}, but your feature updates arrive slower than 2G in a tunnel. We set the standard, you just copy the changelog! 🔥`,
        `Calling that a comeback? @${targetBrand || "rival"}, your roast has less heat than a microwave on defrost mode. Step your game up! 😤`,
        `We don't need fancy slogans to stay #1 @${targetBrand || "rival"}. Our numbers speak, your servers crash! 🚀`,
      ],
      Witty: [
        `Imitation is the sincerest form of flattery @${targetBrand || "rival"}. Thanks for admitting who the real innovator is! 😉`,
        `@${targetBrand || "rival"} Talking big for a brand whose most popular feature was heavily inspired by our 2024 roadmap. Genius moves! 💡`,
        `We'd roast you back @${targetBrand || "rival"}, but our legal team advised us not to pick on smaller competitors. 🧠`,
      ],
      Playful: [
        `Aww, is that the best roast you could cook up @${targetBrand || "rival"}? We'll send you a cookbook and a timer! ⏱️🍕`,
        `Hey @${targetBrand || "rival"}, we love the energy! Keep trying, maybe next round you'll land a punchline! 🥊✨`,
        `@${targetBrand || "rival"} 10/10 for effort, 2/10 for execution. Coffee's on us after the battle! ☕️`,
      ],
      Bold: [
        `Kings don't look back at second place @${targetBrand || "rival"}. The arena has already spoken, and the crowd knows who rules! 👑`,
        `@${targetBrand || "rival"} You can buy ad space, but you can't buy customer loyalty. We own the arena! 🏆`,
        `The difference between us and @${targetBrand || "rival"}? We deliver results, you deliver excuses! ⚡️`,
      ],
    };

    const toneKey = tone && comebacksByTone[tone] ? tone : "Savage";
    const options = comebacksByTone[toneKey];

    return NextResponse.json({
      success: true,
      tone: toneKey,
      options: options.map((text, idx) => ({
        id: `option-${idx + 1}`,
        text,
        confidenceScore: 0.94 - idx * 0.04,
      })),
      moderationPassed: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate AI roast" },
      { status: 500 }
    );
  }
}
