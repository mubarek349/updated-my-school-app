import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import dotenv from "dotenv";
dotenv.config();

const hostname = process.env.HOST || "localhost",
  port = parseInt(process.env.PORT || "3200", 10),
  dev = process.env.NODE_ENV !== "production",
  app = next({ dev, hostname, port, turbo: true });

app.prepare().then(async () => {
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(
    cors({
      origin: "*",
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: "Content-Type,Authorization",
    })
  );
  expressApp.use((req, res) => {
    return app.getRequestHandler()(req, res);
  });

  const httpServer = createServer(expressApp);
  httpServer.listen({ host: app.hostname, port: app.port }, () => {
    console.log(
      `> Server listening at https://${hostname}:${port} as ${
        process.env.NODE_ENV ?? "development"
      }`
    );
  });
});
