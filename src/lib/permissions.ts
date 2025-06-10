// /src/lib/permissions.ts

import { SubscriptionLevel } from "./subscription";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  // NEW: อัปเดต map ตาม plan ใหม่
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    one_time: 1, // สามารถสร้างได้ 1 อันตามเงื่อนไข
    pro: 3,
    pro_plus: Infinity,
  };

  const maxResumes = maxResumeMap[subscriptionLevel];
  return currentResumeCount < maxResumes;
}

export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  // ผู้ใช้ free ใช้ AI ไม่ได้
  return subscriptionLevel !== "free";
}

export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  // เฉพาะ Pro Plus เท่านั้นที่ปรับแต่งได้
  return subscriptionLevel === "pro_plus";
}