import { app } from './app';
import { env } from './config/env.config';

const PORT = env.PORT || 5000;
const NODE_ENV = env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] [INFO] [SERVER] - Server running in [${NODE_ENV}] mode on port [${PORT}]`);
});

// Graceful Shutdown handling
const gracefulShutdown = (signal: string) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] [INFO] [SERVER] - Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log(`[${timestamp}] [INFO] [SERVER] - HTTP server closed. Process exiting.`);
    process.exit(0);
  });
  
  // Timeout shutdown after 10s if connections refuse to close
  setTimeout(() => {
    console.error(`[${timestamp}] [ERROR] [SERVER] - Forced shutdown due to connection timeout.`);
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
