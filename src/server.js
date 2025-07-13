// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import express from 'express';
// import cors from 'cors';
// import pino from 'pino-http';
// import contactsRouter from './routers/contact.js';
// import { notFoundHandler } from './middlewares/notFoundHandler.js';
// import { errorHandler } from './middlewares/errorHandler.js';
// import authRouter from './routers/auth.js';
// import cookieParser from 'cookie-parser';
// import { authenticate } from './middlewares/authenticate.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));

// export const setupServer = () => {
//   const app = express();

//   app.use(cors());
//   app.use(pino());
//   app.use(express.json());
//   app.use(cookieParser());

//   app.use('/auth', authRouter);
//   app.use('/contacts', authenticate, contactsRouter);

//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//   app.use(notFoundHandler);
//   app.use(errorHandler);

//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// };

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contact.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRouter from './routers/auth.js';
import cookieParser from 'cookie-parser';
import { authenticate } from './middlewares/authenticate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаємо згенерований swagger.json (а не openapi.yaml)
const swaggerFilePath = path.join(__dirname, '../docs/swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/contacts', authenticate, contactsRouter);

  // Підключаємо swagger-ui-express на /api-docs
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
