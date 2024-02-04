import { providers } from "@/app/api/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {sendError, sendJson} from "@/app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider") as
    | keyof typeof providers
    | null;
  const referer = searchParams.get('referer')

  if (!provider) return sendError(400, "please provide a ?provider");

  const providerData = providers[provider];

  if (!providerData)
    return sendError(400, `Provider ${provider} is not supported.`);

  const url = providerData.provider.getOauthUrl()

  const redirectUrl = referer || request.headers.get("referer");
  if (redirectUrl) cookies().set({ name: "redirectUrl", value: redirectUrl });

  return sendJson({ url: url });
}
