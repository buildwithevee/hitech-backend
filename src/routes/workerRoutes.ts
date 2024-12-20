import { Router } from "express";
import upload from "../helpers/MulterConfig";
import { assignWorker, changeStatus, createWorker, editAWorker, getASpecificWorker, listAvailableWorkers, workerList } from "../controllers/workerController";


const router = Router();
router.route("/").get(workerList);
router.route("/available").get(listAvailableWorkers)
router.route("/each").get(getASpecificWorker)
router.route("/edit").post(editAWorker)
router.route("/change-status").post(changeStatus)
router.route("/new-worker")
    .post(upload.single('image'), createWorker);
router.route("/assign-job").post(assignWorker)
export default router;