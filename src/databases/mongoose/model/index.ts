// Oauth Login Schemas
import mongoose, {Model, Document} from "mongoose";
import {IUsers, UsersSchema} from "@/databases/mongoose/schema/users";
import {AccountsSchema, IAccounts} from "@/databases/mongoose/schema/accounts";
import {ISessions, SessionsSchema} from "@/databases/mongoose/schema/sessions";

const Accounts: Model<IAccounts & Document> =
  mongoose.models.Account ||
  mongoose.model("Account", AccountsSchema, "accounts");
const Users: Model<IUsers & Document> =
  mongoose.models.Users || mongoose.model("Users", UsersSchema, "users");
const Sessions: Model<ISessions & Document> =
  mongoose.models.Sessions ||
  mongoose.model("Sessions", SessionsSchema, "sessions");


export {
  Accounts,
  Sessions,
  Users,
}