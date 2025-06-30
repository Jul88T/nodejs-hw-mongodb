import { config } from 'dotenv';
config();
console.log('ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET);
console.log('REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);

import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

await initMongoConnection();
setupServer();
