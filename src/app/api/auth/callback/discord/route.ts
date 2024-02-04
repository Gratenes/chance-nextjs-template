import { providers } from "@/app/api/auth";
import { NextRequest } from "next/server";
import axios from "axios";
import {
  createAccount,
  createSession,
  createUser,
} from "@/app/api/auth/src/functions/sessions/create";
import { cookies } from "next/headers";
import {getRedirectUri} from "@/app/api/auth/src/functions/getOAuthUrl";
import {sendErrorRedirect} from "@/app/api";

const discordOauth = providers.discord;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) return sendErrorRedirect(400, "no ?code provided");

  const data = new URLSearchParams();
  data.append("grant_type", "authorization_code");
  data.append("code", code);
  data.append("redirect_uri", getRedirectUri("discord"));

  const token = await axios({
    method: "post",
    url: "https://discord.com/api/oauth2/token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    auth: {
      username: discordOauth.clientId,
      password: discordOauth.clientSecret,
    },
    data: data.toString(),
    validateStatus: () => true,
  });

  const tokenData = token.data;
  if (!tokenData || !tokenData.token_type || !tokenData.access_token)
    return sendErrorRedirect(404, "discord token data request failed");

  console.log(tokenData);

  const userRes = await axios.get("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
    },
  });

  const user = userRes.data;

  if (!user)
    return sendErrorRedirect(404, "could not get user data from discord");
  if (!user.id)
    return sendErrorRedirect(404, "could not get user id from discord");
  if (!user.verified)
    return sendErrorRedirect(404, "please use a verified discord account");

  const accountSchema = {
    accountId: user.id,
    provider: "discord",
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: new Date(new Date().getTime() + tokenData.expires_in * 1000),
    tokenType: tokenData.token_type,
    scope: tokenData.scope || "",
  };

  const userSchema = {
    accountId: user.id,
    email: user.email,
    name: user.username,
    image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    emailVerified: user.verified,
  };

  const [savedAccount, savedUser, savedSession] = await Promise.all([
    createAccount(accountSchema),
    createUser(userSchema),
    createSession(
      { accountId: user.id },
      {
        account: accountSchema,
        user: userSchema,
      },
    ),
  ]);

  const cookie = cookies();

  cookie.set({
    name: "SessionToken",
    value: savedSession.cookieId,
  });

  const referrer = new URL(
    cookie.get("redirectUrl")?.value || "/",
    process.env.NEXTAUTH_URL,
  );
  cookie.delete("redirectUrl");
  return Response.redirect(referrer, 302);
}
