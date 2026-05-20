import dotenv from "dotenv";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { router } from "./routes/route";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
}))
app.use(express.json());
app.use(clerkMiddleware());

app.use(router);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
  