import {providers} from "@/app/api/auth";
import {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {sendErrorRedirect} from "@/app/api";


export async function GET(request: NextRequest, {params}:{params: {id: string}}) {
  const authProvider = providers[params.id as keyof typeof providers];
  return authProvider.provider.handleCallback(request)
}