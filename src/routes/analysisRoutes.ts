import { Router } from "express";

import { dashBoardRepots } from "../controllers/analysisController";

const router = Router();

router.route("/get-stats").get(dashBoardRepots);


export default router;