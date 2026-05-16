"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
    hourly_rate: "",
    availability: "Available now",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .then(({ data }) => {
        if (data) setServices(data);
      });
  }, []);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You need to be signed in to register as a provider.");
      setLoading(false);
      return;
    }

    // upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      location: form.location,
      role: "provider",
    });
    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    // create provider record
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .insert({
        profile_id: user.id,
        bio: form.bio,
        hourly_rate: parseFloat(form.hourly_rate) || null,
        availability: form.availability,
        is_available: true,
      })
      .select()
      .single();
    if (providerError) {
      setMessage(providerError.message);
      setLoading(false);
      return;
    }

    // link services
    if (selectedServices.length > 0) {
      await supabase.from("provider_services").insert(
        selectedServices.map((service_id) => ({
          provider_id: provider.id,
          service_id,
        })),
      );
    }

    setMessage("Profile created successfully!");
    setTimeout(() => router.push("/"), 1500);
    setLoading(false);
  }

  const availabilityOptions = [
    "Available now",
    "Weekdays only",
    "Weekends only",
    "By appointment",
    "24/7",
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="py-5 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Register as a provider
            </h1>
            <p className="text-sm text-gray-500">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? "bg-orange-500" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {/* Step 1: Personal info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800">Personal info</h2>
            {[
              {
                label: "Full name",
                key: "full_name",
                placeholder: "e.g. Sipho Ndlovu",
                type: "text",
              },
              {
                label: "Phone number",
                key: "phone",
                placeholder: "+27 XX XXX XXXX",
                type: "tel",
              },
              {
                label: "Location / area",
                key: "location",
                placeholder: "e.g. Sandton, Johannesburg",
                type: "text",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 block mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400"
                />
              </div>
            ))}
            <button
              onClick={() => setStep(2)}
              disabled={!form.full_name || !form.phone || !form.location}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40 mt-2"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Your services</h2>
            <p className="text-sm text-gray-400 mb-4">
              Select everything you offer
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    selectedServices.includes(service.id)
                      ? "bg-orange-50 border-orange-400 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedServices.length === 0}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rate and bio */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800">
              Your rate & availability
            </h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Hourly rate (ZAR)
              </label>
              <input
                type="number"
                placeholder="e.g. 350"
                value={form.hourly_rate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hourly_rate: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Availability
              </label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, availability: opt }))
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.availability === opt
                        ? "bg-orange-50 border-orange-400 text-orange-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Short bio
              </label>
              <textarea
                rows={3}
                placeholder="Tell customers about your experience and what makes you great..."
                value={form.bio}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 resize-none"
              />
            </div>

            {message && (
              <p
                className={`text-sm text-center ${message.includes("success") ? "text-green-600" : "text-red-500"}`}
              >
                {message}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40"
              >
                {loading ? "Creating..." : "Create profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
