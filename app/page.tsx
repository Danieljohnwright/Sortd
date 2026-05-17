import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const serviceIcons: Record<string, string> = {
  Plumbing: "🔧",
  Electrical: "⚡",
  "Vehicle Repairs": "🚗",
  Roofing: "🏠",
  "Flat Tyres": "🛞",
  Babysitting: "🧡",
  Painting: "🖌️",
  Gardening: "🌿",
  Cleaning: "✨",
  "Pest Control": "🐛",
  Locksmith: "🔑",
  "Appliance Repair": "🔩",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*");
  const { data: providers } = await supabase
    .from("providers")
    .select(
      `*, profiles(full_name, location, avatar_url), provider_services(service_id, services(name))`,
    )
    .eq("is_available", true)
    .limit(6);

  return (
    <main className="max-w-2xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">sortd..</h1>
          <p className="text-sm text-gray-500">Johannesburg, GP</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            Join as Pro
          </Link>
        </div>
      </div>

      {/* Hero search */}
      <div className="bg-orange-500 rounded-2xl p-5 mb-6">
        <h2 className="text-white text-xl font-semibold mb-1">
          What do you need fixed?
        </h2>
        <p className="text-orange-100 text-sm mb-4">
          Browse trusted local service providers near you
        </p>
        <input
          type="text"
          placeholder="Search plumber, electrician..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white text-gray-700"
        />
      </div>

      {/* Services grid */}
      <h3 className="font-semibold text-gray-800 mb-3">Browse services</h3>
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3">
        {services?.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.id}`}
            className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">
              {serviceIcons[service.name] ?? "🛠️"}
            </div>
            <div className="font-medium text-gray-800 text-sm">
              {service.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Top providers */}
      <h3 className="font-semibold text-gray-800 mb-3">Top-rated nearby</h3>
      <div className="flex flex-col gap-3">
        {providers && providers.length > 0 ? (
          providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/providers/${provider.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-semibold text-sm flex-shrink-0">
                {provider.profiles?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {provider.profiles?.full_name ?? "Provider"}
                </div>
                <div className="text-sm text-gray-500">
                  {provider.profiles?.location ?? "Location not set"}
                </div>
                <div className="text-sm text-orange-500 mt-1">
                  {provider.hourly_rate
                    ? `R${provider.hourly_rate}/hr`
                    : "Rate on request"}
                </div>
              </div>
              <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full self-start">
                Available
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border border-gray-100">
            <div className="text-3xl mb-2">🔧</div>
            <p className="text-sm">No providers yet — be the first!</p>
            <Link
              href="/register"
              className="text-orange-500 text-sm font-medium mt-1 inline-block"
            >
              Register as a provider →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
