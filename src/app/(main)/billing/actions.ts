"use server";

import { env } from "@/env";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

export async function createCustomerPortalSession() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // ตรวจสอบว่า user มี subscription หรือไม่
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) {
    throw new Error("No active subscription found. Please subscribe first.");
  }

  // ใช้ stripeCustomerId จาก subscription record แทน
  const stripeCustomerId = subscription.stripeCustomerId || 
    (user.privateMetadata.stripeCustomerId as string | undefined);

  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found. Please contact support.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  });

  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  return session.url;
}
