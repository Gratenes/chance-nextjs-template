import 'server-only'
import mongoose, {Document} from "mongoose";
import {IUsers} from "@/databases/mongoose/schema/users";
import {IAccounts} from "@/databases/mongoose/schema/accounts";
import {Accounts, Sessions, Users} from "@/databases/mongoose/model";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import {Session} from "../functions/auth";

interface Config {
  mongodb_url: string;
}


export class MongooseAuth {
  private static instance: MongooseAuth | null = null;
  private instance: MongooseAuth | null = null;

  private constructor() {
  }

  public static getInstance(config?: Config): MongooseAuth {
    if (!this.instance) {
      if (config) mongoose.connect(config.mongodb_url).then(() => console.log('Connected to Mongoose')).catch(() => console.log('Could not connect to mongoose'))
      this.instance = new MongooseAuth();
    }
    return this.instance
  }

  public async createAccount(data: IAccounts): Promise<IAccounts> {
    const account = await Accounts.findOneAndUpdate<IAccounts & Document>(
      {accountId: data.accountId},
      data,
      {new: true, upsert: true},
    );
    return account.toJSON();
  }

  public async createUser(data: IUsers): Promise<IUsers> {
    const user = await Users.findOneAndUpdate<IUsers & Document>(
      {accountId: data.accountId},
      data,
      {new: true, upsert: true},
    );
    return user.toJSON();
  }

  public async getSession(SessionToken: ISessions['cookieId'], optionalAccount?: IAccounts): Promise<Session | false> {
    const session = await Sessions.findOne<ISessions & Document>({cookieId: SessionToken,});
    if (!session) return false;

    const account = await Accounts.findOne({accountId: session.accountId} as Partial<IAccounts>);
    if (!account) return false;

    if (new Date() > new Date(account.expiresAt)) {
      // Need to implement token refresh, for now just error it out
      /*
        const refreshed = await refreshSession({
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

  public async createSession(data: ISessions): Promise<ISessions> {
    const session = await Sessions.findOneAndUpdate(
      {accountId: data.accountId},
      data,
      {new: true, upsert: true},
    );

    return session.toJSON();
  }
}