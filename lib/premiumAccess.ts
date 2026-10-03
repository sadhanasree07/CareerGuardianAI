import type { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function getPremiumAccess(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  const userId = decoded?.id;

  if (!userId) return null;

  await connectDB();
  const user = await User.findById(userId).select("credits premiumUnlocked premiumUnlockedAt plan");
  if (!user) return null;

  const credits = Math.max(0, Number(user.credits) || 0);
  if (credits >= 100 && (!user.premiumUnlocked || user.plan !== "PREMIUM" || !user.premiumUnlockedAt)) {
    user.premiumUnlocked = true;
    user.plan = "PREMIUM";
    user.premiumUnlockedAt = user.premiumUnlockedAt || new Date();
    await user.save();
  }

  const premiumUnlocked = credits >= 100 && Boolean(user.premiumUnlocked) && user.plan === "PREMIUM";
  return {
    userId: String(user._id),
    credits,
    premiumUnlocked,
    plan: premiumUnlocked ? "PREMIUM" : "FREEMIUM",
    premiumUnlockedAt: user.premiumUnlockedAt || null,
  };
}