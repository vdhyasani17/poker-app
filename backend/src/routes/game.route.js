import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGame, exitGame, getGameState, joinGame } from "../controllers/game.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGame);
router.post("/join", protectRoute, joinGame);

router.get("/:id", protectRoute, getGameState);

router.post("/exit", protectRoute, exitGame);

export default router;