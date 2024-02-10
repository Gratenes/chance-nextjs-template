import 'server-only'

import {cookies} from "next/headers";
import {IUsers} from "@/databases/mongoose/schema/users";
import {providers, secret} from "@/app/api/auth";
import {IAccounts} from "@/databases/mongoose/schema/accounts";
import {SignJWT, jwtVerify, importPKCS8} from "jose";
import {nanoid} from "nanoid";
import {checkToken} from "@/app/api/auth/src/jwt";

export interface Session {
  user: IUsers;
}


export async function sessionsInternal(): Promise<false | Session> {
  const cookie = cookies();
  const sessionTokenString = cookie.get("SessionToken")?.value;

  if (!sessionTokenString) return false

  try {
    const decodedPayload = await checkToken(sessionTokenString)
    if (!decodedPayload || !decodedPayload.payload || !decodedPayload.payload.provider) return false;

    const currentProvider = providers[decodedPayload.payload.provider as keyof typeof providers]

    /*let cacheAccount: IAccounts | undefined = undefined
    if (currentProvider.cache) {
      const cachedAccountString = await currentProvider.cache.getValue(Session)
      if (cachedAccountString) cacheAccount = JSON.parse(cachedAccountString)
    }*/

    return currentProvider.database.getSession(sessionTokenString)
  } catch (e) {
    console.log(e)
    return false
  }
}
