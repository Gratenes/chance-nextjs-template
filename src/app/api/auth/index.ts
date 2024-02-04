import {signInWithProvider} from "@/app/api/auth/src/callbacks/signin";
import {signOutAndReload} from "@/app/api/auth/src/callbacks/signout";
import {sessionsInternal} from "@/app/api/auth/src/functions/sessions";

export const providers = {
  discord: {
    clientId: process.env.discord_client_id as string,
    clientSecret: process.env.discord_client_secret as string,
    scopes: ["identify", "email", "guilds", "guilds.join"],
    authorization: "https://discord.com/api/oauth2/authorize",
  },
};

export const singIn = signInWithProvider

export const signOut = signOutAndReload

export const auth = sessionsInternal;
