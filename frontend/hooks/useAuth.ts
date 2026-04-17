"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const { user, setTokens, setUser, logout: storeLogout, isAdmin } = useAuthStore();

  const sendOtp = async (email: string) => {
    await authApi.sendOtp(email);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await authApi.verifyOtp(email, otp);
    setTokens(data.access_token, data.refresh_token);
    const { data: me } = await authApi.me();
    setUser(me);
    router.push("/");
  };

  const logout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {}
    }
    storeLogout();
    router.push("/login");
  };

  return { user, sendOtp, verifyOtp, logout, isAdmin };
}
