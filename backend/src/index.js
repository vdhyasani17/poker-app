import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import gameRouter from "./routes/game.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/auth", authRouter);
app.use("/api/game", gameRouter);

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
    connectDB();
})