
import dotenv from "dotenv";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
});

export default ratelimit;
