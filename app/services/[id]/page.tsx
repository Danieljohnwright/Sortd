import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ServicePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const { data: providers } = await supabase
    .from("providers")
    .select(
      `
      *,
      profiles(full_name, location, avatar_url),
      provider_services!inner(service_id),
      reviews(rating)
    `,
    )
    .eq("provider_services.service_id", params.id)
    .eq("is_available", true);

  function getAvgRating(reviews: any[]) {
    if (!reviews || reviews.length === 0) return null;
    const avg =
      reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
      reviews.length;
    return avg.toFixed(1);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 py-5">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-xl">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{service.name}</h1>
          <p className="text-sm text-gray-500">
            {providers?.length ?? 0} provider
            {providers?.length !== 1 ? "s" : ""} near you
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["All", "Available now", "Top rated", "Lowest price"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
              filter === "All"
                ? "bg-orange-500 text-white border-orange-500"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Provider list */}
      {providers && providers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {providers.map((provider) => {
            const rating = getAvgRating(provider.reviews);
            const initials =
              provider.profiles?.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") ?? "?";

            return (
              <Link
                key={provider.id}
                href={`/providers/${provider.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {provider.profiles?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {provider.profiles?.location}
                        </p>
                      </div>
                      <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {provider.availability ?? "Available"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-sm font-medium text-gray-700">
                            {rating}
                          </span>
                          <span className="text-sm text-gray-400">
                            ({provider.reviews?.length} reviews)
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-orange-500">
                        {provider.hourly_rate
                          ? `R${provider.hourly_rate}/hr`
                          : "Rate on request"}
                      </div>
                    </div>

                    {provider.bio && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {provider.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">
            No providers yet for this service
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Be the first to offer {service.name}!
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600"
          >
            Register as a provider
          </Link>
        </div>
      )}
    </main>
  );
}
