// /src/components/premium/PremiumModal.tsx

"use client";

import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { createCheckoutSession } from "./actions";

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePlanClick(priceId: string) {
    try {
      setLoading(priceId);
      const redirectUrl = await createCheckoutSession(priceId);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: t("common.errorMessage"),
      });
    } finally {
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "one_time",
      title: t("premium.oneTime.title"),
      price: t("premium.oneTime.price"),
      description: t("premium.oneTime.description"),
      features: t("premium.oneTime.features") as string[],
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME,
      buttonText: t("premium.oneTime.button"),
      variant: "outline" as const,
    },
    {
      id: "pro",
      title: t("premium.pro.title"),
      price: t("premium.pro.price"),
      description: t("premium.pro.description"),
      features: t("premium.pro.features") as string[],
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
      buttonText: t("premium.pro.button"),
      variant: "default" as const,
    },
    {
      id: "pro_plus",
      title: t("premium.proPlus.title"),
      price: t("premium.proPlus.price"),
      description: t("premium.proPlus.description"),
      features: t("premium.proPlus.features") as string[],
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
      buttonText: t("premium.proPlus.button"),
      variant: "premium" as const,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("premium.title")}
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {t("premium.choosePlan")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.id === "pro_plus" 
                  ? "border-gradient-to-r from-green-400 to-emerald-500 bg-gradient-to-br from-green-50 to-emerald-50 scale-105" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {plan.id === "pro_plus" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    <Star className="mr-2 h-4 w-4 fill-current" />
                    {t("common.popular")}
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                </div>
                <p className="mt-2 text-base text-gray-500">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 flex-grow space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanClick(plan.priceId)}
                disabled={!!loading}
                variant={plan.variant}
                className={`mt-8 w-full py-3 text-base font-semibold transition-all duration-200 ${
                  plan.id === "pro_plus"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl"
                    : ""
                }`}
              >
                {loading === plan.priceId ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {t("common.loading")}
                  </div>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}