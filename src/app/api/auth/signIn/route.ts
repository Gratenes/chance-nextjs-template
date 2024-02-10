import {providers} from "@/app/api/auth";
import {NextRequest} from "next/server";
import {sendError} from "@/app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider") as
    | keyof typeof providers
    | null;
  const referer = request.headers.get('redirect_url') || request.headers.get('referer') || undefined

  if (!provider) return sendError(400, "please provide a ?provider");

  const providerData = providers[provider];

  if (!providerData) return sendError(400, `Provider ${provider} is not supported.`);

  return providerData.provider.handleSignIn(request, referer)
}
