"use server";
import { cookies } from "next/headers";
import { Document } from "mongoose";
import {IUsers} from "@/databases/mongoose/schema/users";
import {IAccounts} from "@/databases/mongoose/schema/accounts";
import {Accounts, Sessions, Users} from "@/databases/mongoose/model";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import RedisClient from "@/databases/redis";

export interface Session {
  user: IUsers;
}

const redisClient = RedisClient.getInstance();

export async function sessionsInternal() {
  const cookie = cookies();
  const SessionToken = cookie.get("SessionToken");

  if (!SessionToken?.value) return false;

  let cookieAccount = await redisClient.getValue(SessionToken.value);
  let account: IAccounts | null = null;

  if (!cookieAccount) {
    const session = await Sessions.findOne<ISessions & Document>({
      cookie: SessionToken.value,
    });
    if (!session) return false;

    account = await Accounts.findOne({
      accountId: session.accountId,
    } as Partial<IAccounts>);
  } else {
    account = JSON.parse(cookieAccount);
  }

  if (!account) return false;
  if (new Date() > new Date(account.expiresAt)) {
    /*const refreshed = await refreshSession({
      provider: "discord",
      cookieId: SessionToken.value,
      account: account,
    });
    if (!refreshed) return false;
  */
    return false;
  }

  const user = await Users.findOne<Document & IUsers>({
    accountId: account.accountId,
  } as Partial<IUsers>);

  if (!user) return false;

  return {
    user: user.toJSON(),
  } as Session;
}
