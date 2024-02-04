import { IAccounts } from "@/database/mongo/schema/user/auth/accounts";
import { providers } from "@/app/api/auth";
import axios from "axios";
import {
  createAccount,
  createUser,
  updateSession,
} from "@/app/api/auth/src/functions/sessions/create";

export const refreshSession = async (data: {
  account: IAccounts;
  cookieId: string;
  provider: keyof typeof providers;
}) => {
  try {
    const providerSecrets = providers[data.provider];

    const tokenResponse = await axios({
      url: `https://discord.com/api/oauth2/token`,
      data: data.account,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: providerSecrets.clientId,
        password: providerSecrets.clientSecret,
      },
    });

    const tokenData = tokenResponse.data;
    if (!tokenData || !tokenData.token_type || !tokenData.access_token)
      return false;

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });
    const user = userResponse.data;
    if (!user) return false;
    if (!user.id) return false;
    if (!user.verified) return false;

    const accountSchema = {
      accountId: user.accountId,
      provider: "discord",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(new Date().getTime() + tokenData.expires_in * 1000),
      tokenType: tokenData.token_type,
      scope: tokenData.scope || "",
    };

    const userSchema = {
      accountId: user.id,
      email: user.email,
      name: user.username,
      image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      emailVerified: user.verified,
    };

    const [savedAccount, savedUser, savedSession] = await Promise.all([
      createAccount(accountSchema),
      createUser(userSchema),
      updateSession(
        { accountId: user.id, cookieId: data.cookieId },
        {
          account: accountSchema,
          user: userSchema,
        },
      ),
    ]);

    return {
      account: savedAccount,
      user: savedUser,
      session: savedSession,
    };
  } catch (e) {
    console.log(e);
    return false;
  }
};
