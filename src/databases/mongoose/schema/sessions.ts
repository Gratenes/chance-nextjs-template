import { Schema } from "mongoose";

export interface ISessions {
  cookieId: string;
  provider: string
  accountId: string;
}

export const SessionsSchema = new Schema<ISessions>({
  accountId: String,
  provider: String,
  cookieId: String,
});
