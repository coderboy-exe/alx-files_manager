import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
  constructor () {
    this.client = createClient();
    this.client.on('error', err => console.log('Redis client not connected to the server:', err));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getter = promisify(this.client.get).bind(this.client);
    const value = await getter(key);
    return value;
  }

  async set(key, value, duration) {
    const setterEx = promisify(this.client.setex).bind(this.client);
    await setterEx(key, duration, value);
  }

  async del(key) {
    const del = promisify(this.client.del).bind(this.client);
    await del(key);
  }
}


const redisClient = new RedisClient();

export default redisClient;
