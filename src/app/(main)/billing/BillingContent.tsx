// /src/app/(main)/billing/BillingContent.tsx

"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "date-fns";
import Stripe from "stripe";
import GetSubscriptionButton from "./GetSubscriptionButton";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

interface UserSubscription {
  stripeCurrentPeriodEnd: Date | string;
  stripeCancelAtPeriodEnd: boolean;
}

interface BillingContentProps {
  subscription: UserSubscription | null;
  priceInfo: Stripe.Price | null;
  isOneTimePayment: boolean;
}

export default function BillingContent({ 
  subscription, 
  priceInfo, 
  isOneTimePayment 
}: BillingContentProps) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <h1 className="text-3xl font-bold">{t("billing.title")}</h1>
      <p>
        {t("billing.currentPlan")}{" "}
        <span className="font-bold">
          {priceInfo ? (priceInfo.product as Stripe.Product).name : t("billing.free")}
        </span>
      </p>
      {subscription ? (
        <>
          {isOneTimePayment ? (
            <p>
              {t("billing.oneTimeExpiry")}{" "}
              {formatDate(subscription.stripeCurrentPeriodEnd, "MMMM dd, yyyy")}
            </p>
          ) : subscription.stripeCancelAtPeriodEnd && (
            <p className="text-destructive">
              {t("billing.subscriptionCancel")}{" "}
              {formatDate(subscription.stripeCurrentPeriodEnd, "MMMM dd, yyyy")}
            </p>
          )}
          
          {/* Temporarily disabled until Stripe customer portal is configured */}
          <ManageSubscriptionButton />
          {/* <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> ระบบจัดการการสมัครสมาชิกกำลังอยู่ระหว่างการตั้งค่า
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              หากต้องการยกเลิกหรือเปลี่ยนแปลงการสมัครสมาชิก กรุณาติดต่อฝ่ายสนับสนุน
            </p>
          </div> */}
        </>
      ) : (
        <GetSubscriptionButton />
      )}
    </main>
  );
}