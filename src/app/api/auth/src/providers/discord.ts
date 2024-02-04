import 'server-only'
import axios from "axios";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import {generateSHA256} from "@/app/api/auth/src/functions/generateSHA256";
import {providers} from "@/app/api/auth";


interface Config {
  client_id: string;
  client_secret: string;
  scopes: string[];
  authorization: string;
}


export class DiscordProvider {
  private static instance: DiscordProvider | null = null;
  name: "discord" = 'discord'
  public credential: Config;

  private constructor(credential: Config) {
    // Initialize credential during the construction
    this.credential = credential;
  }

  public static getInstance(config: Config): DiscordProvider {
    if (!this.instance) {
      this.instance = new DiscordProvider(config);
    }
    return this.instance
  }

  public getRedirectUri(url?:string) {
    return `${url || process.env.NEXTAUTH_URL}/api/auth/callback/discord`
  }

  public getOauthUrl(redirect_uri?:string): string {
    return `${this.credential.authorization}?scope=${this.credential.scopes.join(
      "+",
    )}&client_id=${this.credential.client_id}&response_type=code&redirect_uri=${redirect_uri || this.getRedirectUri()}`;
  }

  public async getToken(code: string) {
    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", this.getRedirectUri());

    return axios({
      method: "post",
      url: "https://discord.com/api/oauth2/token",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      auth: {
        username: this.credential.client_id,
        password: this.credential.client_secret,
      },
      data: data.toString(),
      validateStatus: () => true,
    });
  }

  public async getUser(tokenData: any) {
    return await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });
  }

  public saveData(user: any, tokenData: any) {
    const oauth = providers[this.name]
    const accountSchema = {
      accountId: user.id,
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

    console.log(userSchema)

    const sessionSchema: ISessions = {
      cookieId: `${generateSHA256()}.discord`,
      accountId: user.id,
      provider: 'discord'
    };

    const createPromises: any = [
      oauth.database.createAccount(accountSchema),
      oauth.database.createUser(userSchema),
      oauth.database.createSession(sessionSchema)
    ];

    if (oauth.cache) {
      createPromises.push(
        oauth.cache.setValue(
          sessionSchema.cookieId,
          JSON.stringify(accountSchema), {
            expire: Math.floor(
              (new Date(accountSchema.expiresAt).getTime() - new Date().getTime()) /
              1000,
            ),
          })
      );
    }

    return Promise.all(createPromises);
  }
}