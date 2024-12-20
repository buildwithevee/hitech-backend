import { Request, Response } from "express";
import { handleSingleFileUpload } from "../utils/uploader";
import Worker, { IWorker } from "../models/workerModel";
import mongoose from "mongoose";
import { JobCard } from "../models/jobCardModel";


export const createWorker = async (req: Request, res: Response): Promise<void> => {


    try {
        const { workerName, phoneNumber } = req.body;
        if ([workerName, phoneNumber].some((field) => field.trim() === "")) {
            res.status(400).json({ message: "All fields are required", success: false })
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "No files provided", success: false });
            return;
        }
        const result = await handleSingleFileUpload(req, req.file);
        if (!result.success) {
            res.status(400).json({ message: "upload unsuccessfull", success: false });
            return;
        }
        const imageData = result?.uploadData;
        const workerData = await Worker.create({
            workerName,
            phoneNumber,
            workerImage: imageData.url,
            key: imageData.key
        });
        if (workerData) {
            res.status(200).json({ message: "worker created successfully", success: true });
            return;
        } else {
            res.status(401).json({ message: "Error while creating worker", success: false });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}

export const workerList = async (req: Request, res: Response): Promise<void> => {
    try {
        const pageNo: number = parseInt(req.query.page as string) || 1; // Default to page 1
        const limitOf: number = parseInt(req.query.limit as string) || 10; // Default to limit 10

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            res.status(400).json({ message: "Invalid page or limit value", success: false });
            return;
        }

        const skip: number = (pageNo - 1) * limitOf; // Calculate the number of documents to skip

        const workers = await Worker.find().skip(skip).limit(limitOf);
        const countOfDocuments = await Worker.countDocuments();
        if (workers) {
            res.status(200).json({ message: "fetched successfully", success: true, workers, totalPages: Math.ceil(countOfDocuments / limitOf) });
            return;
        } else {
            res.status(200).json({ message: "fetching unsuccessfull", success: false, workers: [], totalPages: 1 });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}
export const getASpecificWorker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.query;

        const worker = await Worker.findById(id);
        if (worker) {
            res.status(200).json({ message: "fetched successfully", success: true, worker });
            return;
        } else {
            res.status(200).json({ message: "fetching unsuccessfull", success: false, worker: [] });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}

export const editAWorker = async (req: Request, res: Response) => {
    try {
        const { id, workerName, phoneNumber } = req.body;
        if (!id) {
            res.status(400).json({ message: "id is required", success: false });
            return;
        }
        const worker = await Worker.findById(id);
        if (!worker) {
            res.status(400).json({ message: "no such worker found", success: false });
            return;
        }
        if (workerName) worker.workerName = workerName;
        if (phoneNumber) worker.phoneNumber = phoneNumber;
        await worker.save();
        res.status(200).json({ message: "updated successfully", success: true, worker });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}


export const changeStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({ message: "id is required", success: false });
            return;
        }
        const worker = await Worker.findById(id);
        if (!worker) {
            res.status(400).json({ message: "no such worker found", success: false });
            return;
        }
        worker.status = !worker.status;
        await worker.save();
        res.status(200).json({ message: "updated successfully", success: true, worker });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}
export const listAvailableWorkers = async (req: Request, res: Response): Promise<void> => {
    try {
        const workers = await Worker.find({ status: true });
        if (workers) {
            res.status(200).json({ message: "fetched successfully", success: true, workers });
            return;
        } else {
            res.status(200).json({ message: "fetching unsuccessfull", success: false, workers: [] });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}

export const assignWorker = async (req: Request, res: Response): Promise<void> => {

    try {
        const { workerId, jobcardId } = req.body;
        if (!workerId || !jobcardId) {
            res.status(400).json({ message: "both field are required", success: false });
            return;
        }
        if (!mongoose.isValidObjectId(workerId) || !mongoose.isValidObjectId(jobcardId)) {
            res.status(400).json({ message: "both field must be valid id", success: false });
            return;
        }
        const worker = await Worker.findById(workerId);
        if (!worker) {
            res.status(400).json({ message: "worker not found", success: false });
            return;
        }
        const jobcard = await JobCard.findById(jobcardId);

        if (!jobcard) {
            res.status(400).json({ message: "jobcard not found", success: false });
            return;
        }

        jobcard.worker = new mongoose.Types.ObjectId(workerId);
        await jobcard.save();
        res.status(200).json({ message: "Assigned successfully", success: false })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
        return;
    }
}