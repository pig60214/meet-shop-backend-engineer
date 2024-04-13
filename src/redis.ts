import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();
const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
const redis = new Redis(port);
export default redis;
