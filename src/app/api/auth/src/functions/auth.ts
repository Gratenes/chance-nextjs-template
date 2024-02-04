import 'server-only'

import {cookies} from "next/headers";
import {IUsers} from "@/databases/mongoose/schema/users";
import {providers} from "@/app/api/auth";
import {IAccounts} from "@/databases/mongoose/schema/accounts";

export interface Session {
  user: IUsers;
}


export async function sessionsInternal(): Promise<false | Session> {
  const cookie = cookies();
  const Session = cookie.get("SessionToken")?.value;

  if (!Session) return false

  const SessionProvider = Session.split('.')[1]
  
  const currentProvider = providers[SessionProvider as keyof typeof providers]

  /*let cacheAccount: IAccounts | undefined = undefined
  if (currentProvider.cache) {
    const cachedAccountString = await currentProvider.cache.getValue(Session)
    if (cachedAccountString) cacheAccount = JSON.parse(cachedAccountString)
  }*/

  return currentProvider.database.getSession(Session)
}
