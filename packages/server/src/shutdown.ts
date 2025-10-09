const startTime = Date.now();
import type { Server } from "node:http";

import database from "./database";
import { valkey, isActive } from "./cache";
import logger from "./utils/logger";

// 3s
const GRACE_PERIOD_MS = 3000;

export async function closeConnection(
  server: Server,
  signal: string,
  err?: unknown,
) {
  logger.info(`Starting shutdown process for signal: ${signal}`);

  try {
    if (err) {
      logger.error({
        code: "FATAL",
        message: "Shutting down due to error",
        err,
      });
    } else {
      logger.info(`${signal} received. Starting graceful shutdown...`);
    }

    // Stop accepting new connections
    logger.info("Stopping server from accepting new connections...");
    await new Promise<void>((resolve, reject) => {
      if (!server || !server.listening) {
        logger.info("Server not listening, skipping close");
        return resolve();
      }

      const timeout = setTimeout(() => {
        reject(new Error("Server close timeout"));
      }, 5000);

      server.close((closeErr) => {
        clearTimeout(timeout);
        if (closeErr) {
          logger.error("Error closing server:", closeErr);
          reject(closeErr);
        } else {
          logger.info("Server stopped accepting new connections");
          resolve();
        }
      });
    });

    logger.info("Closing active connections...");

    // Get all active connections and close them
    if (server && "getConnections" in server) {
      await new Promise<void>((resolve) => {
        server.getConnections((err, count) => {
          if (err) {
            logger.error("Error getting connection count:", err);
          } else {
            logger.info(`Active connections: ${count}`);
          }
          resolve();
        });
      });
    }

    // Close connections in parallel for faster shutdown
    const shutdownPromises = [];

    // Close database connections
    shutdownPromises.push(
      database.destroy().then(
        () => logger.info("Database connection pool closed"),
        (dbErr) => {
          logger.error({
            code: "DB_SHUTDOWN",
            message: "Error closing database",
            dbErr,
          });
        },
      ),
    );

    // Close cache connections if active
    if (isActive) {
      shutdownPromises.push(
        new Promise<void>((resolve) => {
          valkey.disconnect(false); // false = don't reconnect
          logger.info("Cache connection closed");
          resolve();
        }).catch((cacheErr) => {
          logger.error({
            code: "CACHE_SHUTDOWN",
            message: "Error closing cache",
            cacheErr,
          });
        }),
      );
    }

    // Wait for all connections to close with a reasonable timeout
    const results = await Promise.allSettled(shutdownPromises);

    // Log results
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error(`Shutdown promise ${index} failed:`, result.reason);
      }
    });

    logger.info("All shutdown operations completed");
  } catch (e) {
    logger.error({
      code: "SHUTDOWN_ERROR",
      message: "Error during shutdown",
      e,
    });
  } finally {
    const exitCode = err ? 1 : 0;
    const totalTime = (Date.now() - startTime) / 1000;

    logger.info(`Shutdown process completed in ${totalTime}s`);

    // Force flush logs and exit
    if (logger.end && typeof logger.end === "function") {
      logger.end(() => {
        process.exit(exitCode);
      });
    } else {
      // Add a small delay to ensure logs are flushed
      setTimeout(() => {
        logger.info("Graceful shutdown completed, exiting...");
        process.exit(exitCode);
      }, 500);
    }

    // Fallback force exit if something hangs
    const timeout = setTimeout(() => {
      console.error(`Force exiting after ${GRACE_PERIOD_MS}ms timeout`);
      process.exit(exitCode);
    }, GRACE_PERIOD_MS);

    // Don't keep the process alive just for this timeout
    timeout.unref();
  }
}
