// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || "development";

import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();
app.disable("x-powered-by");

// contains key-value pairs of data submitted in the request body
app.use(express.json());

// enable all CORS requests
app.use(cors());

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
