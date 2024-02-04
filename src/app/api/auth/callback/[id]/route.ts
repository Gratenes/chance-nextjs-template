import {providers} from "@/app/api/auth";
import {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {sendErrorRedirect} from "@/app/api";


export async function GET(request: NextRequest, {params}:{params: {id: string}}) {
  const authProvider = providers[params.id as keyof typeof providers];

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if(!code) return sendErrorRedirect(400, "no ?code provided");

  const token = await authProvider.provider.getToken(code);
  const tokenData = token.data;

  if(!tokenData || !tokenData.token_type || !tokenData.access_token)
    return sendErrorRedirect(404, "discord token data request failed");

  const userRes = await authProvider.provider.getUser(tokenData);
  const user = userRes.data;

  if(!user)
    return sendErrorRedirect(404, "could not get user data from discord");

  if (!user.id)
    return sendErrorRedirect(404, "could not get user id from discord");

  if (!user.verified)
    return sendErrorRedirect(404, "please use a verified discord account");

  const [savedAccount, savedUser, savedSession, cacheValue] = await authProvider.provider.saveData(user, tokenData);

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