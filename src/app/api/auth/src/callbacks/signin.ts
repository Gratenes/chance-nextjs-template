import {providers} from "@/app/api/auth";

export async function signInWithProvider(provider: keyof typeof providers) {
  const oauthUrlRequest = await fetch(`/api/auth/signIn?provider=${provider}`);
  const oauthUrlJson = await oauthUrlRequest.json();

  // Navigate to the URL
  if (typeof window !== "undefined" && oauthUrlJson.data.url) {
    window.location.href = oauthUrlJson.data.url;
  } else {
    throw new Error("This function can only be used on the client-side.");
  }
}