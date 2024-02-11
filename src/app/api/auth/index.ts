import {sessionsInternal} from "@/app/api/auth/src/functions/auth";
import {DiscordProvider} from "@/app/api/auth/src/providers/discord";
import {MongooseAuth} from "@/app/api/auth/src/databases/mongo";
import {RedisClient} from "@/app/api/auth/src/databases/redis";
import {SmptProvider} from "@/app/api/auth/src/providers/smtp";
import { env } from '@/env.mjs';

export const secret: string = env.NEXTAUTH_SECRET!

export const providers = {
  discord: {
    database: MongooseAuth.getInstance({mongodb_url: env.NEXT_PUBLIC_MONGODB_URL!}),
    provider: DiscordProvider.getInstance({
      client_id: env.DISCORD_CLIENT_ID!,
      client_secret: env.DISCORD_CLIENT_SECRET!,
      scopes: ["identify", "email", "guilds", "guilds.join"],
      authorization: "https://discord.com/api/oauth2/authorize",
    }),
    cache: RedisClient.getInstance({redis_url: env.REDIS_URL!}),
  },
  smtp: {
    database: MongooseAuth.getInstance({mongodb_url: env.NEXT_PUBLIC_MONGODB_URL!}),
    provider: SmptProvider.getInstance({
      host: env.SMTP_HOST!,
      port: Number(env.SMTP_PORT!),
      password: env.SMTP_PASSWORD!,
      username: env.SMTP_USERNAME!,
      secure: env.SMTP_SECURE === 'true'
    }),
    cache: RedisClient.getInstance({redis_url: env.REDIS_URL!}),
  },
};

export const auth = sessionsInternal;