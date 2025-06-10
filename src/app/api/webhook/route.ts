// /src/app/api/webhook/route.ts

import { env } from "@/env";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// ---- HANDLER FUNCTIONS ----

/**
 * จัดการเมื่อ Checkout Session เสร็จสมบูรณ์
 * โดยเฉพาะสำหรับ One-Time Payment
 */
async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;

    console.log("=== WEBHOOK: Session Completed ===");
    console.log("Session ID:", session.id);
    console.log("User ID from metadata:", userId);
    console.log("Session mode:", session.mode);
    console.log("Customer:", session.customer);

    if (!userId) {
      console.error("❌ Session missing userId metadata", session.id);
      throw new Error("User ID is missing in session metadata");
    }

    // Clerk: อัปเดตเฉพาะเมื่อมี customer จริง
    if (session.customer) {
      try {
        const stripeCustomerId = typeof session.customer === "string"
          ? session.customer
          : (session.customer as any)?.id || "";

        if (stripeCustomerId) {
          await (await clerkClient()).users.updateUserMetadata(userId, {
            privateMetadata: {
              stripeCustomerId,
            },
          });
          console.log("✅ Updated Clerk metadata for user:", userId);
        }
      } catch (e) {
        console.error("❌ Failed to update Clerk metadata", e);
        // Don't throw - continue with subscription creation
      }
    }

    // จัดการ one-time payment
    if (session.mode === "payment") {
      console.log("Processing one-time payment...");
      
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 5,
        });
        console.log("Line items:", JSON.stringify(lineItems, null, 2));
        
        const priceId = lineItems.data[0]?.price?.id;
        console.log("Price ID from line items:", priceId);
        console.log("Expected one-time price ID:", env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME);

        if (!priceId) {
          console.error("❌ Price ID missing in lineItems");
          throw new Error("Price ID missing in session line items");
        }

        if (priceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME) {
          console.log("✅ Price ID matches one-time payment");
          
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 15);
          console.log("Setting expiry date to:", expiryDate.toISOString());

          const stripeCustomerId = typeof session.customer === "string"
            ? session.customer
            : (session.customer as any)?.id || `temp_customer_${userId}`;

          const subscription = await prisma.userSubscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: `one_time_${session.id}`,
              stripeCustomerId,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: expiryDate,
              stripeCancelAtPeriodEnd: false,
            },
            update: {
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: expiryDate,
              stripeCancelAtPeriodEnd: false,
            },
          });
          
          console.log("✅ Successfully created/updated subscription:", subscription);
          console.log(`✅ User ${userId} now has one-time access until ${expiryDate.toISOString()}`);
          
        } else {
          console.log(`❌ Price ID ${priceId} does not match one-time price ID`);
        }
      } catch (paymentError) {
        console.error("❌ Error processing one-time payment:", paymentError);
        throw paymentError;
      }
    } else {
      console.log("Session mode is not 'payment', skipping one-time payment processing");
    }
    
    console.log("=== ✅ END WEBHOOK: Session Completed ===");
  } catch (error) {
    console.error("=== ❌ WEBHOOK ERROR ===");
    console.error("Error in handleSessionCompleted:", error);
    console.error("Session ID:", session.id);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    console.log("=== END WEBHOOK ERROR ===");
    throw error;
  }
}

/**
 * จัดการเมื่อมีการสร้างหรืออัปเดต Subscription (Pro, Pro Plus)
 */
async function handleSubscriptionCreatedOrUpdated(subscriptionId: string) {
  try {
    console.log("=== WEBHOOK: Subscription Created/Updated ===");
    console.log("Subscription ID:", subscriptionId);

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("Retrieved subscription:", JSON.stringify(subscription, null, 2));

    const userId = subscription.metadata?.userId;
    console.log("User ID from metadata:", userId);

    if (!userId) {
      console.error("❌ Subscription missing userId metadata");
      throw new Error("User ID is missing in subscription metadata");
    }

    console.log("Subscription status:", subscription.status);
    console.log("Price ID:", subscription.items.data[0]?.price?.id);
    console.log("Current period end:", new Date(subscription.current_period_end * 1000));

    if (
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due"
    ) {
      console.log("✅ Subscription is active, creating/updating user subscription");

      const subscriptionRecord = await prisma.userSubscription.upsert({
        where: {
          userId: userId,
        },
        create: {
          userId: userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log("✅ Successfully created/updated subscription record:", subscriptionRecord);

      // Update Clerk metadata
      try {
        await (await clerkClient()).users.updateUserMetadata(userId, {
          privateMetadata: {
            stripeCustomerId: subscription.customer as string,
          },
        });
        console.log("✅ Updated Clerk metadata for user:", userId);
      } catch (clerkError) {
        console.error("❌ Failed to update Clerk metadata:", clerkError);
        // Don't throw - subscription creation is more important
      }

    } else {
      console.log("❌ Subscription is not active, deleting user subscription");
      await prisma.userSubscription.deleteMany({
        where: {
          stripeCustomerId: subscription.customer as string,
        },
      });
      console.log("✅ Deleted inactive subscription records");
    }

    console.log("=== ✅ END WEBHOOK: Subscription Created/Updated ===");
  } catch (error) {
    console.error("=== ❌ SUBSCRIPTION WEBHOOK ERROR ===");
    console.error("Error in handleSubscriptionCreatedOrUpdated:", error);
    console.error("Subscription ID:", subscriptionId);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    console.log("=== END SUBSCRIPTION WEBHOOK ERROR ===");
    throw error;
  }
}

/**
 * จัดการเมื่อ Subscription ถูกลบ
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
     console.error("Webhook Error: userId not found in subscription metadata for deletion.", { subscriptionId: subscription.id });
    return;
  }
  
  // ลบ record ของ user คนนี้ออกไปเลย
  await prisma.userSubscription.delete({
    where: { userId },
  }).catch(error => {
      // อาจจะหาไม่เจอถ้าถูกลบไปแล้ว ไม่เป็นไร
      console.log(`Info: Could not delete subscription for userId=${userId}, it might have been deleted already.`);
  });
  console.log(`Webhook Success: Deleted subscription for userId=${userId}.`);
}


// ---- MAIN WEBHOOK ENDPOINT ----

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not set.");
    return new NextResponse("Internal Server Error: Webhook secret not configured.", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionCreatedOrUpdated(event.data.object.id);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
     console.error("Error handling webhook event:", { type: event.type, error });
     return new NextResponse("Internal Server Error while handling webhook.", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}