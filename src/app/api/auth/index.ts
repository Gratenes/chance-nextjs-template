import {sessionsInternal} from "@/app/api/auth/src/functions/auth";
import {DiscordProvider} from "@/app/api/auth/src/providers/discord";
import {MongooseAuth} from "@/app/api/auth/src/databases/mongo";
import {RedisClient} from "@/app/api/auth/src/providers/redis";

export const providers = {
  discord: {
    database: MongooseAuth.getInstance({mongodb_url: process.env.MONGODB_URL!}),
    provider: DiscordProvider.getInstance({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      scopes: ["identify", "email", "guilds", "guilds.join"],
      authorization: "https://discord.com/api/oauth2/authorize",
    }),
    cache: RedisClient.getInstance({redis_url: process.env.REDIS_URL!}),
  },
  google: {
    database: MongooseAuth.getInstance({mongodb_url: process.env.MONGODB_URL!}),
    provider: DiscordProvider.getInstance({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      scopes: ["identify", "email", "guilds", "guilds.join"],
      authorization: "https://discord.com/api/oauth2/authorize",
    }),
    cache: RedisClient.getInstance({redis_url: process.env.REDIS_URL!}),
  },
};

export const auth = sessionsInternal;