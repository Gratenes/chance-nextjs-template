import { providers } from "@/app/api/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {sendError, sendJson} from "@/app/api";
import {getOAuthUrl} from "@/app/api/auth/src/functions/getOAuthUrl";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider") as
    | keyof typeof providers
    | null;

  if (!provider) return sendError(400, "please provide a ?provider");

  const providerData = providers[provider];

  if (!providerData)
    return sendError(400, `Provider ${provider} is not supported.`);

  const url = getOAuthUrl(provider);

  const referrer = request.headers.get("referer");
  if (referrer) cookies().set({ name: "redirectUrl", value: referrer });

  return sendJson({ url: url });
}
