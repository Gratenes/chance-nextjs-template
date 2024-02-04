import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieHandler = cookies();
  cookieHandler.delete("SessionToken");

  return new Response();
}
