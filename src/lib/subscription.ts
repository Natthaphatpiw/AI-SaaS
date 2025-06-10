// /src/lib/subscription.ts

import { env } from "@/env";
import { cache } from "react";
import prisma from "./prisma";

// NEW: เพิ่ม type ให้ครบถ้วน
export type SubscriptionLevel = "free" | "one_time" | "pro" | "pro_plus";

export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return "free";
    }

    // ตรวจสอบว่า subscription ยังไม่หมดอายุ
    const isExpired = new Date() > subscription.stripeCurrentPeriodEnd;
    if (isExpired) {
      return "free";
    }

    // ตรวจสอบตาม Price ID
    switch (subscription.stripePriceId) {
      case env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME:
        return "one_time";
      case env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY:
        return "pro";
      case env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY:
        return "pro_plus";
      default:
        // ถ้าไม่ตรงกับ Price ID ไหนเลยแต่ยังมี subscription ให้ถือว่าเป็น free (อาจเป็น plan เก่าที่ยกเลิกไปแล้ว)
        return "free";
    }
  },
);

// DEBUG: ฟังก์ชันสำหรับตรวจสอบ subscription details
export async function debugUserSubscription(userId: string) {
  console.log("=== DEBUG USER SUBSCRIPTION ===");
  console.log("User ID:", userId);
  
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });
  
  console.log("Subscription Record:", subscription);
  console.log("Current Date:", new Date());
  
  if (subscription) {
    console.log("Subscription Expiry:", subscription.stripeCurrentPeriodEnd);
    console.log("Is Expired:", new Date() > subscription.stripeCurrentPeriodEnd);
    console.log("Price ID:", subscription.stripePriceId);
    console.log("Expected One-Time Price ID:", env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME);
    console.log("Price ID Match:", subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME);
  }
  
  const level = await getUserSubscriptionLevel(userId);
  console.log("Final Subscription Level:", level);
  console.log("=== END DEBUG ===");
  
  return { subscription, level };
}