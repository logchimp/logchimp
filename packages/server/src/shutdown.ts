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
    await new Promise<void>((resolve) => {
      // If server isn't listening yet, resolve immediately
      if (!server || !("close" in server)) return resolve();
      server.close(() => resolve());
    });

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
    await Promise.allSettled(shutdownPromises);
  } catch (e) {
    logger.error({
      code: "SHUTDOWN_ERROR",
      message: "Error during shutdown",
      e,
    });
  } finally {
    const exitCode = err ? 1 : 0;

    // Add a small delay to ensure logs are flushed
    setTimeout(() => {
      logger.info("Graceful shutdown completed");
      process.exit(exitCode);
    }, 100);

    // Fallback force exit if something hangs
    const timeout = setTimeout(() => {
      logger.error({
        code: "FORCE_EXIT",
        message: `Exiting forcefully after ${GRACE_PERIOD_MS}ms`,
      });
      process.exit(exitCode);
    }, GRACE_PERIOD_MS);
    timeout.unref?.();
  }
}
