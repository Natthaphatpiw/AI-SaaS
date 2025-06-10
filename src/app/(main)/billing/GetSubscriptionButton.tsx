"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function GetSubscriptionButton() {
  const premiumModal = usePremiumModal();
  const { t } = useLanguage();

  return (
    <Button onClick={() => premiumModal.setOpen(true)} variant="premium">
      {t("billing.getSubscription")}
    </Button>
  );
}
