import { Server } from 'node:http';
import mongoose from 'mongoose';
import httpServer from './app.js';  // Import HTTP server from app.ts
import config from './app/config/index.js';
import seedSuperAdmin from './app/DB/index.js';
let server: Server;
async function main() {
  try {
    // await mongoose.connect("mongodb://localhost:27017/performance-room-server" as string);
    await mongoose.connect("mongodb+srv://farmacy-app:eTrpH1S4J5N9TreG@cluster0.mkpcxwu.mongodb.net/property-development?retryWrites=true&w=majority&appName=Cluster0" as string);

    // const port = config.port || 3000;  // Default to 3000 if undefined

    await seedSuperAdmin();
    server = httpServer.listen(config.port, () => {
      // server = app.listen(5000, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

// Handle server shutdown gracefully
main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
