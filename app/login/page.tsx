"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Utensils, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await login(restaurantId.trim(), apiKey.trim());
      localStorage.setItem("portal_token", token);
      localStorage.setItem("portal_restaurant_id", restaurantId.trim());
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid credentials";
      setError(
        (err as { status?: number }).status === 401
          ? "Invalid restaurant ID or API key"
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-[#6c63ff]" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-[#f0f0f5]">
              HeyAspen Portal
            </h1>
            <p className="text-[12px] text-[#55556a]">Restaurant Management</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2a32] bg-[#111114] p-6">
          <h2 className="text-[18px] font-semibold text-[#f0f0f5] mb-1">
            Sign in
          </h2>
          <p className="text-[13px] text-[#8888a0] mb-6">
            Enter your restaurant ID and API key
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                Restaurant ID
              </label>
              <input
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                placeholder="e.g. ChIJxxx..."
                autoComplete="username"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-[13px] text-red-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !restaurantId || !apiKey}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6c63ff] text-white text-[14px] font-medium hover:bg-[#7c74ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[#55556a] mt-4">
          Powered by{" "}
          <span className="text-[#6c63ff]">MoveMatrix</span>
        </p>
      </div>
    </div>
  );
}
