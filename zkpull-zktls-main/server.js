import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import config from "./config/env.config.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/", routes);

const HOST = '0.0.0.0';
const PORT = config.server.port;

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
