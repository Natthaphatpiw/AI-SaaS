import { env } from "@/env";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import SuccessContent from "./SuccessContent";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  const isOneTimePayment = subscription?.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME;

  return (
    <SuccessContent isOneTimePayment={isOneTimePayment} />
  );
}
