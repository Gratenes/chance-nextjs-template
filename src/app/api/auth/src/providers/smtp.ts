import 'server-only'
import axios from "axios";
import {ISessions} from "@/databases/mongoose/schema/sessions";
import {generateSHA256} from "@/app/api/auth/src/functions/generateSHA256";
import {providers} from "@/app/api/auth";
import {NextRequest} from "next/server";
import {sendErrorRedirect, sendJson} from "@/app/api";
import {cookies} from "next/headers";
import {createToken} from "@/app/api/auth/src/jwt";
import nodemailer, {Transporter} from "nodemailer"
import { env } from '@/env.mjs';

interface Config {
  host: string,
  port?: number,
  username?: string,
  password?: string
  secure: boolean
}


export class SmptProvider {
  private static instance: SmptProvider | null = null;
  name: "smtp" = 'smtp'
  public credential: Config;
  private transporter: Transporter;

  private constructor(credential: Config) {
    // Initialize credential during the construction
    this.credential = credential;

    this.transporter = nodemailer.createTransport({
      host: credential.host,
      port: credential.port,
      secure: credential.secure, // upgrade later with STARTTLS
      auth: {
        user: credential.username,
        pass: credential.password
      }
    });
  }

  public static getInstance(config: Config): SmptProvider {
    if (!this.instance) {
      this.instance = new SmptProvider(config);
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




    /*
    * This is going to be the callback for when the link is clicked from the mail inbox of the person its sent from
    * */


    // redirect to check inbox screen
    const referrer = new URL(`/api/auth/message?message=${'Please check your inbox for a verification email'}`, env.NEXTAUTH_URL,);
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

    const email = request.headers.get('email')
    const password = request.headers.get('password')

    if (!email || !password) return sendErrorRedirect(400, 'Please provide a username and password')

    const [mailVerificationToken, passwordVerificationToken] = await Promise.all([
      createToken({provider: "smtp", email: email, sub: email}, new Date(new Date().getTime() + 900000)),
      createToken({provider: "smtp", email: email, password: password, sub: email}, new Date(new Date().getTime() + 900000))
    ])
    await providers[this.name].cache.setValue(mailVerificationToken, passwordVerificationToken, {
      expire: 900000
    })

    await this.transporter.sendMail({
      from: 'Chance <no-reply@chancecant.design>',
      to: email,
      subject: "Verification Email",
      text: `${env.NEXTAUTH_URL}/api/auth/callback/smtp?token=${mailVerificationToken}`
    })

    //Check if sign in, and if so please just return it as a token in cookies

    // redirect to check inbox screen
    const referrer = new URL(`/api/auth/message?message=${'Please check your inbox for a verification email'}`, env.NEXTAUTH_URL,);
    return Response.redirect(referrer, 302);
  }

  public async handleSignOut(request: NextRequest) {
    return
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