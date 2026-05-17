"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  description: string;
  created_at: string;
  provider_id: string;
  providers: {
    profiles: { full_name: string; phone: string } | null;
  } | null;
  services: { name: string } | null;
};

export default function CustomerDashboard({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "confirmed" | "completed"
  >("pending");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          providers(profiles(full_name, phone)),
          services(name)
        `,
        )
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (data) setBookings(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function cancelBooking(bookingId: string) {
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)),
    );
  }

  const filtered = bookings.filter((b) => b.status === activeTab);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    confirmed: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading your bookings...</div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/"
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center hover:bg-orange-100 transition-colors"
        >
          <div className="text-2xl mb-1">🔍</div>
          <div className="text-sm font-medium text-orange-700">
            Find a provider
          </div>
        </Link>
        <Link
          href="/register"
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center hover:bg-gray-100 transition-colors"
        >
          <div className="text-2xl mb-1">🛠️</div>
          <div className="text-sm font-medium text-gray-600">
            Become a provider
          </div>
        </Link>
      </div>

      {/* Bookings */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["pending", "confirmed", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-3">
                No {activeTab} bookings
              </p>
              {activeTab === "pending" && (
                <Link
                  href="/"
                  className="inline-block px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600"
                >
                  Find a provider
                </Link>
              )}
            </div>
          ) : (
            filtered.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.providers?.profiles?.full_name ?? "Provider"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.services?.name} ·{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {booking.description && (
                  <p className="text-sm text-gray-500 mb-3 bg-gray-50 rounded-xl px-3 py-2">
                    {booking.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/providers/${booking.provider_id}`}
                    className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm text-center hover:bg-gray-50"
                  >
                    View provider
                  </Link>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="flex-1 py-2 border border-red-100 text-red-500 rounded-xl text-sm hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === "completed" && (
                    <Link
                      href={`/providers/${booking.provider_id}#review`}
                      className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm text-center font-medium hover:bg-orange-600"
                    >
                      Leave review
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
