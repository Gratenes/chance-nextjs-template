import { Document } from "mongoose";
import {Accounts, Sessions, Users} from "@/databases/mongoose/model";
import {IAccounts} from "@/databases/mongoose/schema/accounts";
import {IUsers} from "@/databases/mongoose/schema/users";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import {generateSHA256} from "@/app/api/auth/src/functions/generateSHA256";
import RedisClient from "@/databases/redis";

const redisClient = RedisClient.getInstance();

export const createAccount = async (data: IAccounts): Promise<IAccounts> => {
  const account = await Accounts.findOneAndUpdate<IAccounts & Document>(
    { accountId: data.accountId },
    data,
    { new: true, upsert: true },
  );
  return account.toJSON();
};

export const createUser = async (data: IUsers): Promise<IUsers> => {
  const user = await Users.findOneAndUpdate<IUsers & Document>(
    { accountId: data.accountId },
    data,
    { new: true, upsert: true },
  );
  return user.toJSON();
};

export const createSession = async (
  data: {
    accountId: string;
  },
  info: {
    user: IUsers;
    account: IAccounts;
  },
): Promise<ISessions> => {
  const result = await Sessions.findOne<ISessions & Document>({
    accountId: data.accountId,
  });

  // Free old cookie from its never ending demise
  let cookie = result?.cookieId || "";
  const hasCurrentCookie = await redisClient.getValue(result?.cookieId || "");
  if (hasCurrentCookie) redisClient.deleteKey(cookie);

  // Make a new cookie and set it
  cookie = generateSHA256();
  await redisClient.setValue(cookie, JSON.stringify(info.account), {
    expire: Math.floor(
      (new Date(info.account.expiresAt).getTime() - new Date().getTime()) /
        1000,
    ),
  });

  const session = await Sessions.findOneAndUpdate(
    { accountId: data.accountId },
    { accountId: data.accountId, cookieId: cookie },
    { new: true, upsert: true },
  );

  return session.toJSON();
};

export const updateSession = async (
  data: ISessions,
  info: {
    user: IUsers;
    account: IAccounts;
  },
) => {
  await redisClient.setValue(data.cookieId, JSON.stringify(info.account), {
    expire: Math.floor(
      (new Date(info.account.expiresAt).getTime() - new Date().getTime()) /
        1000,
    ),
  });
};
