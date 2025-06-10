// /src/app/(main)/billing/page.tsx

import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { getUserSubscriptionLevel } from "@/lib/subscription"; // NEW
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import BillingContent from "./BillingContent";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }
  
  // NEW: ใช้ function กลางในการหา subscription level
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  let priceInfo = null;

  if (subscription?.stripePriceId) {
    try {
      const rawPriceInfo = await stripe.prices.retrieve(
        subscription.stripePriceId,
        {
          expand: ["product"],
        },
      );
      priceInfo = JSON.parse(JSON.stringify(rawPriceInfo));
    } catch (error) {
        console.error("Failed to retrieve price info:", error);
        // ไม่ต้อง throw error ปล่อยให้ priceInfo เป็น null
    }
  }

  // ✅ subscription ควร serialize เช่นกัน
  const plainSubscription = subscription
    ? JSON.parse(JSON.stringify(subscription))
    : null;

  return (
    <BillingContent
      subscription={plainSubscription}
      priceInfo={priceInfo}
      subscriptionLevel={subscriptionLevel} // NEW: ส่ง level ไปด้วย
    />
  );
}