import { Schema } from "mongoose";

export interface IUsers {
  name: string;
  email: string;
  image: string;
  accountId: string;
  emailVerified: boolean;
}

export const UsersSchema = new Schema<IUsers>({
  name: String,
  email: String,
  image: String,
  accountId: String,
  emailVerified: Boolean,
});
