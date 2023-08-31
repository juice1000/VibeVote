import { createClient } from 'redis';

const sessionClient = createClient();
async function connectToRedis(): Promise<void> {
  sessionClient.on('error', (err) => console.log('Redis Client Error', err));
  await sessionClient.connect();
}

export { sessionClient, connectToRedis };
