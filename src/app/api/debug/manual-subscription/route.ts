import { auth } from "@clerk/nextjs/server";
import { env } from "@/env";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: requestUserId, planType = "one_time" } = await req.json();
    const { userId: authUserId } = await auth();

    // ตรวจสอบ authentication
    if (!authUserId || authUserId !== requestUserId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let stripePriceId: string;
    let expiryDate: Date;

    // กำหนด price ID และ expiry date ตามแผน
    switch (planType) {
      case "one_time":
        stripePriceId = env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME;
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15); // 15 วัน
        break;
      case "pro":
        stripePriceId = env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY;
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 เดือน
        break;
      case "pro_plus":
        stripePriceId = env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY;
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 เดือน
        break;
      default:
        throw new Error("Invalid plan type");
    }

    // สร้าง manual subscription
    const subscription = await prisma.userSubscription.upsert({
      where: { userId: requestUserId },
      create: {
        userId: requestUserId,
        stripeSubscriptionId: `manual_${planType}_${Date.now()}`,
        stripeCustomerId: `manual_customer_${requestUserId}`,
        stripePriceId,
        stripeCurrentPeriodEnd: expiryDate,
        stripeCancelAtPeriodEnd: false,
      },
      update: {
        stripePriceId,
        stripeCurrentPeriodEnd: expiryDate,
        stripeCancelAtPeriodEnd: false,
      },
    });

    console.log(`Manual ${planType} subscription created:`, subscription);

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        message: `Manual ${planType} subscription created successfully`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Manual subscription creation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 