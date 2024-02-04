import {providers} from "@/app/api/auth";

export function getRedirectUri(provider: keyof typeof providers) {
  return `${process.env.NEXTAUTH_URL}/api/auth/callback/${provider}`;
}

export function getOAuthUrl(provider: keyof typeof providers) {
  const { clientId, authorization, scopes } =
    providers[provider as keyof typeof providers];
  const redirectUri = getRedirectUri(provider);
  return `${authorization}?scope=${scopes.join(
    "+",
  )}&client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
}