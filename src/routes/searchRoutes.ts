import { Router } from "express";
import { SearhJobCard } from "../controllers/jobTaskController";

const router = Router();

router.route("/").get(SearhJobCard);

export default router;