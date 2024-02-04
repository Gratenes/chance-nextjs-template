import { Schema } from "mongoose";

export interface IAccounts {
  accountId: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

export const AccountsSchema = new Schema<IAccounts>({
  provider: { type: String, required: true },
  accountId: { type: String, required: true },
  tokenType: { type: String, required: true },
  accessToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  refreshToken: { type: String, required: true },
  scope: { type: String, required: true },
});
