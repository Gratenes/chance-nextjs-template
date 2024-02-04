import Redis, { Redis as RedisInstance } from "ioredis";

interface SetValueOptions {
  expire: number;
}

class RedisClient {
  private static instance: RedisClient | null = null;
  private static redisClient: RedisInstance | null = null;

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private get client(): RedisInstance {
    if (!RedisClient.redisClient) {
      if (!process.env.redis_url) {
        throw new Error('Redis URL is missing');
      }
      RedisClient.redisClient = new Redis(process.env.redis_url);
    }

    return RedisClient.redisClient;
  }

  public async getValue(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async setValue(key: string, value: string, options: SetValueOptions = { expire: 60 * 60 }): Promise<unknown> {
    return this.client.setex(key, options.expire, value,);
  }

  public async deleteKey(key: string): Promise<number> {
    return this.client.del(key);
  }

  public async connect(): Promise<void> {
    await this.client.connect();
    console.log("Redis client connected");
  }
}

export default RedisClient;