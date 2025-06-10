import { auth } from "@clerk/nextjs/server";
import { debugUserSubscription } from "@/lib/subscription";
import { canUseAITools, canUseCustomizations, canCreateResume } from "@/lib/permissions";
import { env } from "@/env";
import ManualWebhookTrigger from "./ManualWebhookTrigger";
import prisma from "@/lib/prisma";

export default async function DebugPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const { subscription, level } = await debugUserSubscription(userId);
  const canUseAI = canUseAITools(level);
  const canCustomize = canUseCustomizations(level);

  // Get current resume count
  const resumeCount = await prisma.resume.count({
    where: { userId },
  });
  const canCreate = canCreateResume(level, resumeCount);

  // Get max resumes for current plan
  const maxResumesMap = {
    free: 1,
    one_time: 1,
    pro: 3,
    pro_plus: Infinity,
  };
  const maxResumes = maxResumesMap[level];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6">Debug User Subscription</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">User Info</h2>
          <p>User ID: {userId}</p>
          <p>Current Resume Count: {resumeCount}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment Variables</h2>
          <p>One-Time Price ID: {env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME}</p>
          <p>Pro Price ID: {env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY}</p>
          <p>Pro Plus Price ID: {env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Subscription Record</h2>
          {subscription ? (
            <pre className="text-sm overflow-auto">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          ) : (
            <p>No subscription found</p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <h2 className="font-semibold text-blue-800">Subscription Analysis</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p>Level: <strong className="text-lg">{level.toUpperCase()}</strong></p>
              <p>Current Time: {new Date().toISOString()}</p>
              {subscription && (
                <>
                  <p>Expiry Time: {subscription.stripeCurrentPeriodEnd.toISOString()}</p>
                  <p>Is Expired: <strong>{new Date() > subscription.stripeCurrentPeriodEnd ? "YES" : "NO"}</strong></p>
                </>
              )}
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Plan Comparison:</h3>
              <p>One-Time: {subscription?.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME ? "✅" : "❌"}</p>
              <p>Pro: {subscription?.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY ? "✅" : "❌"}</p>
              <p>Pro Plus: {subscription?.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY ? "✅" : "❌"}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h2 className="font-semibold text-green-800">Feature Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium">Resume Creation</h3>
              <p>Can Create: <strong>{canCreate ? "YES" : "NO"}</strong></p>
              <p>Current: {resumeCount}</p>
              <p>Max: {maxResumes === Infinity ? "Unlimited" : maxResumes}</p>
            </div>
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium">AI Tools</h3>
              <p>Access: <strong>{canUseAI ? "YES" : "NO"}</strong></p>
              <p>Available for: One-Time, Pro, Pro Plus</p>
            </div>
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium">Customizations</h3>
              <p>Access: <strong>{canCustomize ? "YES" : "NO"}</strong></p>
              <p>Available for: Pro Plus only</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold">Manual Actions</h2>
          <ManualWebhookTrigger userId={userId} />
        </div>
      </div>
    </div>
  );
} 