import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();
app.disable("x-powered-by");

// utils
import logchimpConfig from "./utils/logchimpConfig";
const config = logchimpConfig();
if (!config) {
  console.log(
    "LogChimp configuration missing!\nTry running this command 'logchimp install' again.",
  );
  process.exit(1);
}

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// contains key-value pairs of data submitted in the request body
app.use(express.json());

// enable all CORS requests
app.use(cors());

// import all routes
app.use(routes);

module.exports = app;
