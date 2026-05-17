import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProviderDashboard from "@/components/dashboard/ProviderDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // if no profile yet, send them to register or a setup page
  if (!profile) redirect("/register");

  const isProvider = profile.role === "provider";

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-bold text-orange-500">sortd.</h1>
          <p className="text-sm text-gray-500">
            Hey, {profile.full_name?.split(" ")[0] ?? "there"} 👋
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isProvider
                ? "bg-orange-50 text-orange-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {isProvider ? "Provider" : "Customer"}
          </span>
        </div>
      </div>

      {/* Role-based dashboard */}
      {isProvider ? (
        <ProviderDashboard userId={user.id} />
      ) : (
        <CustomerDashboard userId={user.id} />
      )}
    </main>
  );
}
