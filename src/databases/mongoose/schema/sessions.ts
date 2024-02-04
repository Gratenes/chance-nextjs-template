import { Schema } from "mongoose";

export interface ISessions {
  cookieId: string;
  accountId: string;
}

export const SessionsSchema = new Schema<ISessions>({
  accountId: String,
  cookieId: String,
});
