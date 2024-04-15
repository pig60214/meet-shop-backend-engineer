import Redis from 'ioredis';
import dotenv from 'dotenv';

if (process.env.NODE_ENV) {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}
const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
const host = process.env.REDIS_HOST ?? '127.0.0.1';
const redis = new Redis({ port, host });
export default redis;
