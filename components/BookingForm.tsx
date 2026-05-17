"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BookingForm({
  providerId,
  providerName,
}: {
  providerId: string;
  providerName: string;
}) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  async function handleBooking() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      customer_id: user.id,
      provider_id: providerId,
      description,
      status: "pending",
    });

    if (error) setMessage(error.message);
    else setMessage("Booking request sent! The provider will be in touch.");

    setLoading(false);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <h2 className="font-semibold text-gray-800 mb-3">Request a booking</h2>

      <textarea
        rows={3}
        placeholder={`Describe what you need from ${providerName}...`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 resize-none mb-3"
      />

      {message && (
        <p
          className={`text-sm mb-3 text-center ${
            message.includes("sent") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      <button
        onClick={handleBooking}
        disabled={loading || !description}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
      >
        {loading ? "Sending..." : "Send booking request"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-2">
        You need to be signed in to book
      </p>
    </div>
  );
}
