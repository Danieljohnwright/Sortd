import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default async function ProviderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("providers")
    .select(
      `
      *,
      profiles(full_name, location, phone, avatar_url),
      provider_services(service_id, services(name)),
      reviews(rating, comment, created_at, profiles(full_name))
    `,
    )
    .eq("id", params.id)
    .single();

  if (!provider) notFound();

  const reviews = provider.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const initials =
    provider.profiles?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("") ?? "?";

  return (
    <main className="max-w-2xl mx-auto px-4 pb-20">
      {/* Back */}
      <div className="py-5">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
      </div>

      {/* Profile header */}
      <div className="bg-orange-500 rounded-2xl p-6 text-white mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {provider.profiles?.full_name}
            </h1>
            <p className="text-orange-100 text-sm">
              {provider.profiles?.location}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {provider.provider_services?.map((ps: any) => (
                <span
                  key={ps.service_id}
                  className="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                >
                  {ps.services?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Rating", value: avgRating ? `${avgRating} ★` : "New" },
          { label: "Reviews", value: reviews.length },
          {
            label: "Rate",
            value: provider.hourly_rate ? `R${provider.hourly_rate}/hr` : "TBD",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-2xl p-3 text-center"
          >
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* About */}
      {provider.bio && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <h2 className="font-semibold text-gray-800 mb-2">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {provider.bio}
          </p>
        </div>
      )}

      {/* Availability */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold text-gray-800 mb-2">Availability</h2>
        <span
          className={`inline-block text-sm px-3 py-1 rounded-full ${
            provider.is_available
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {provider.is_available ? "● Available now" : "○ Not available"}
        </span>
        {provider.availability && (
          <p className="text-sm text-gray-500 mt-2">{provider.availability}</p>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.map((review: any, i: number) => (
              <div
                key={i}
                className="border-b border-gray-50 last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {review.profiles?.full_name ?? "Anonymous"}
                  </span>
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-500">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No reviews yet — be the first to book!
          </p>
        )}
      </div>

      {/* Booking form */}
      <BookingForm
        providerId={provider.id}
        providerName={provider.profiles?.full_name}
      />
    </main>
  );
}
