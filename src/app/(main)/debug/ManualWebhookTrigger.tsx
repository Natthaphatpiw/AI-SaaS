"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ManualWebhookTriggerProps {
  userId: string;
}

export default function ManualWebhookTrigger({ userId }: ManualWebhookTriggerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleManualSubscription = async (planType: "one_time" | "pro" | "pro_plus") => {
    try {
      setLoading(planType);
      
      const response = await fetch("/api/debug/manual-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, planType }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message + " Please refresh the page.",
        });
        // Refresh page after 1 second
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Failed to create manual subscription");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create manual subscription",
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "one_time" as const,
      name: "One-Time (฿299 - 15 days)",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "pro" as const,
      name: "Pro (฿499/month)",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "pro_plus" as const,
      name: "Pro Plus (฿699/month)",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        If webhook failed, you can manually create any subscription plan:
      </p>
      <div className="grid grid-cols-1 gap-2">
        {plans.map((plan) => (
          <Button
            key={plan.id}
            onClick={() => handleManualSubscription(plan.id)}
            disabled={!!loading}
            variant="outline"
            className={`text-white ${plan.color} ${loading === plan.id ? "opacity-50" : ""}`}
          >
            {loading === plan.id ? "Creating..." : `Create ${plan.name}`}
          </Button>
        ))}
      </div>
    </div>
  );
} 