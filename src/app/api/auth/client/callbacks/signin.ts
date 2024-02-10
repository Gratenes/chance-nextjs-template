"use client";
import {providers} from "@/app/api/auth";
import axios from "axios";
import {JsonResult} from "@/app/api";

interface SignInConfig {
  redirect_url?: string
  email?: string,
  password?: string,
}

export async function signInWithProvider(provider: keyof typeof providers, config?: SignInConfig) {
  const { data: oauthUrlJson } = await axios.get<JsonResult<{url: string}>>('/api/auth/signIn', {
    params: {
      provider: provider,
    },
    headers: {
      ...config
    }
  });

  // Navigate to the URL
  if (typeof window !== "undefined" && oauthUrlJson.data.url) {
    window.location.href = oauthUrlJson.data.url;
  } else {
    throw new Error("This function can only be used on the client-side.");
  }
}