import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

app.use(
  cors({
    origin: "",
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "RentNest API is running successfully",
  });
});

export default app;
