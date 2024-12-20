import { Router } from "express";
import { AddImagesToJobCard, billJobCard, createJobTask, editJobTask, getCompleted, getCreatedJobTaskById, getJobcardById, getPendingTasks, getReturnedTasks, listAllJobCard, reports, returnJobcard, skipImageUpload, workDoneJobcard } from "../controllers/jobTaskController";
import upload from "../helpers/MulterConfig";

const router = Router();
router.route("/get-pending").get(getPendingTasks);
router.route("/get-returned").get(getReturnedTasks);
router.route("/get-completed").get(getCompleted);
router.route("/get-billed").get(getCompleted);

router.route("/reports").get(reports);
router.route("/")
    .post(createJobTask)
    .get(listAllJobCard)
router.route("/:id").get(getCreatedJobTaskById);
router.route("/edit-card").put(editJobTask)
router.route("/upload/:id")
    .post(upload.array('images', 5), AddImagesToJobCard);
router.route("/skip/:id").post(skipImageUpload);
router.route("/get-a-single-card/:id").get(getJobcardById)
router.route("/return").put(returnJobcard);
router.route("/work-done").put(workDoneJobcard);
router.route("/bill-done").put(billJobCard);
export default router;
