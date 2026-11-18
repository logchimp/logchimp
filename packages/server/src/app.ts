// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || "development";

import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";

import routes from "./routes";
import { rateLimit } from "./middlewares/rateLimit";
import { apiRateLimiter } from "./services/rateLimit/limiters";

const app = express();
app.disable("x-powered-by");

if (process.env.LOGCHIMP_TRUST_PROXY === "true") {
  app.set("trust proxy", true);
}

// contains key-value pairs of data submitted in the request body
app.use(express.json());

// enable all CORS requests
app.use(cors());

// baseline rate limit for every API request
app.use("/api", rateLimit(apiRateLimiter));

// import all routes
app.use(routes);

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof URIError) {
    res.status(400).send({
      message: "bad URL",
      code: "DECODE_URI_ERROR",
    });
    return;
  }
  next();
});

export default app;
