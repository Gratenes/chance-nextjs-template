import 'server-only'
import axios from "axios";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import {generateSHA256} from "@/app/api/auth/src/functions/generateSHA256";
import {providers, secret} from "@/app/api/auth";
import {sendErrorRedirect, sendJson} from "@/app/api";
import jwt from 'jsonwebtoken';
import {cookies} from "next/headers";
import {NextRequest} from "next/server";
import {importPKCS8, SignJWT} from "jose";
import {nanoid} from "nanoid";
import {createToken} from "@/app/api/auth/src/jwt";
import { env } from '@/env.mjs';


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

  /**
   * Handles the callback from an external authentication provider.
   * Obtains the authentication code from the request and retrieves the access token.
   * Retrieves user data using the access token and performs various checks.
   * Saves the user data and token information.
   * Sets the session token and redirects the user back to the referring page.
   *
   * @param {NextRequest} request - The request object containing the authentication callback information.
   * @return {Response} - The redirect response.
   */
  public async handleCallback(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) return sendErrorRedirect(400, "no ?code provided");

    const token = await this.getToken(code);
    const tokenData = token.data;

    if (!tokenData || !tokenData.token_type || !tokenData.access_token)
      return sendErrorRedirect(404, "discord token data request failed");

    const userRes = await this.getUser(tokenData);
    const user = userRes.data;

    if (!user)
      return sendErrorRedirect(404, "could not get user data from discord");

    if (!user.id)
      return sendErrorRedirect(404, "could not get user id from discord");

    if (!user.verified)
      return sendErrorRedirect(404, "please use a verified discord account");

    const [savedAccount, savedUser, savedSession, cacheValue] = await this.saveData(user, tokenData);

    const cookie = cookies();
    cookie.set({
      name: "SessionToken",
      value: savedSession.cookieId,
    });

    const referrer = new URL(
      cookie.get("redirectUrl")?.value || "/",
      env.NEXTAUTH_URL,
    );
    cookie.delete("redirectUrl");

    return Response.redirect(referrer, 302);
  }

  /**
   * Handles the sign-in process and returns the OAuth URL.
   *
   * @param {NextRequest} request - The request object.
   * @param {string} [referer] - The referer URL.
   * @returns {Promise<Object>} - The JSON response containing the OAuth URL.
   */
  public async handleSignIn(request: NextRequest, referer?: string) {
    const url = this.getOauthUrl()

    cookies().set({name: "redirectUrl", value: referer || "/"});

    return sendJson({url: url});
  }

  public async handleSignOut(request: NextRequest) {
    return
  }


  private getRedirectUri(url?: string) {
    return `${url || env.NEXTAUTH_URL}/api/auth/callback/discord`
  }

  private getOauthUrl(redirect_uri?: string): string {
    return `${this.credential.authorization}?scope=${this.credential.scopes.join(
      "+",
    )}&client_id=${this.credential.client_id}&response_type=code&redirect_uri=${redirect_uri || this.getRedirectUri()}`;
  }

  private async getToken(code: string) {
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

  private async getUser(tokenData: any) {
    return await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });
  }

  private async saveData(user: any, tokenData: any) {
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

    const cookieId = await createToken({
      sub: user.email,
      provider: "discord",
      email: user.email,
      accountId: user.id,
    }, new Date(new Date().getTime() + tokenData.expires_in * 1000))

    const sessionSchema: ISessions = {
      cookieId: cookieId,
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