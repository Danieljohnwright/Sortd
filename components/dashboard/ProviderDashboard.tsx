"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  description: string;
  created_at: string;
  profiles: { full_name: string; phone: string } | null;
  services: { name: string } | null;
};

type Stats = {
  total: number;
  pending: number;
  completed: number;
};

type Tab = "pending" | "confirmed" | "completed";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const TABS: Tab[] = ["pending", "confirmed", "completed"];

export default function ProviderDashboard({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("profile_id", userId)
        .single();

      if (!provider) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("bookings")
        .select("*, profiles(full_name, phone), services(name)")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      if (data) {
        setBookings(data);
        setStats({
          total: data.length,
          pending: data.filter((b) => b.status === "pending").length,
          completed: data.filter((b) => b.status === "completed").length,
        });
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  async function updateStatus(bookingId: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
    setStats((prev) => ({
      ...prev,
      pending: status === "confirmed" ? prev.pending - 1 : prev.pending,
      completed: status === "completed" ? prev.completed + 1 : prev.completed,
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const filtered = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Completed", value: stats.completed },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-2xl p-3 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/register"
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center hover:bg-orange-100 transition-colors"
        >
          <div className="text-2xl mb-1">✏️</div>
          <div className="text-sm font-medium text-orange-700">
            Edit profile
          </div>
        </Link>
        <Link
          href="/"
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center hover:bg-gray-100 transition-colors"
        >
          <div className="text-2xl mb-1">👁️</div>
          <div className="text-sm font-medium text-gray-600">View listing</div>
        </Link>
      </div>

      {/* Bookings */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
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

        {/* Booking list */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No {activeTab} bookings
            </div>
          ) : (
            filtered.map((booking) => (
              <div key={booking.id} className="p-4">
                {/* Booking header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.profiles?.full_name ?? "Customer"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.services?.name} ·{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Description */}
                {booking.description && (
                  <p className="text-sm text-gray-500 mb-3 bg-gray-50 rounded-xl px-3 py-2">
                    {booking.description}
                  </p>
                )}

                {/* Phone */}
                {booking.profiles?.phone && (
                  <a
                    href={`tel:${booking.profiles.phone}`}
                    className="text-sm text-orange-500 font-medium mb-3 block"
                  >
                    📞 {booking.profiles.phone}
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(booking.id, "completed")}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
                    >
                      Mark as completed
                    </button>
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
