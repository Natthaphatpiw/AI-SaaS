"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useState } from "react";
import { createCustomerPortalSession } from "./actions";

export default function ManageSubscriptionButton() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const redirectUrl = await createCustomerPortalSession();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      
      let errorMessage = t("common.errorMessage") as string;
      
      // แสดงข้อความ error ที่เฉพาะเจาะจงมากขึ้น
      if (error instanceof Error) {
        if (error.message.includes("No active subscription")) {
          errorMessage = "คุณไม่มีการสมัครสมาชิกที่ใช้งานอยู่ กรุณาสมัครก่อน";
        } else if (error.message.includes("Stripe customer ID not found")) {
          errorMessage = "ไม่พบข้อมูลลูกค้า กรุณาติดต่อฝ่ายสนับสนุน";
        } else if (error.message.includes("No configuration provided") || 
                   error.message.includes("default configuration has not been created")) {
          errorMessage = "ระบบจัดการการสมัครสมาชิกกำลังอยู่ระหว่างการตั้งค่า กรุณาลองใหม่อีกครั้งภายหลัง";
        }
      }
      
      toast({
        variant: "destructive",
        title: "ไม่สามารถเข้าถึงระบบจัดการได้",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton onClick={handleClick} loading={loading}>
      {t("billing.manageSubscription")}
    </LoadingButton>
  );
}
