import mongoose, { ObjectId, Types } from "mongoose";
import { IJobCard, Counter, ICounter, JobCard } from "../models/jobCardModel";
import { Request, Response } from "express";

import { handleMultipleFileUploads } from "../utils/uploader";
import { JobCardImage } from "../models/jobCardImage";
export const createJobTask = async (req: Request, res: Response): Promise<any> => {

    const {
        customerName,
        customerAddress,
        phoneNumber,
        Make,
        HP,
        KVA,
        RPM,
        Type,
        Frame,
        SrNo,
        DealerName,
        DealerNumber,
        works,
        spares,
        industrialworks,
        attachments,
        warranty,
        others
    } = req.body;

    // Validate required fields
    if (!customerName || !customerAddress || !phoneNumber || !SrNo) {
        return res.status(400).json({ message: "Every field is required", success: false });
    }
    if (isNaN(Number(HP))) {
        return res.status(400).json({ message: "HP must be a number", success: false });
    }

    try {


        const counter = await Counter.findOneAndUpdate(
            { _id: "jobCardNumber" },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        const jobcard = new JobCard({
            jobCardNumber: counter.sequence_value,
            customerName,
            customerAddress,
            phoneNumber,
            Make,
            HP,
            KVA,
            RPM,
            Type,
            Frame,
            SrNo,
            DealerName,
            DealerNumber,
            works,
            spares,
            industrialworks,
            attachments,
            warranty,
            jobCardStatus: "Created",
            others: others
        })

        await jobcard.save();
        return res.status(201).json({ message: "Job card created successfully", success: true, data: jobcard });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const editJobTask = async (req: Request, res: Response): Promise<any> => {

    const {
        id,
        customerName,
        customerAddress,
        phoneNumber,
        Make,
        HP,
        KVA,
        RPM,
        Type,
        Frame,
        SrNo,
        DealerName,
        DealerNumber,
        works,
        spares,
        industrialworks,
        attachments,
        warranty,
        others,
        jobCardStatus
    } = req.body;

    try {
        // Validate if the ID exists
        const jobCard = await JobCard.findById(id);
        if (!jobCard) {
            return res.status(404).json({ message: "Job card not found", success: false });
        }

        // Validate required fields
        if (!customerName || !customerAddress || !phoneNumber || !SrNo) {
            return res.status(400).json({ message: "Every field is required", success: false });
        }
        if (isNaN(Number(HP))) {
            return res.status(400).json({ message: "HP must be a number", success: false });
        }

        // Update fields
        jobCard.customerName = customerName || jobCard.customerName;
        jobCard.customerAddress = customerAddress || jobCard.customerAddress;
        jobCard.phoneNumber = phoneNumber || jobCard.phoneNumber;
        jobCard.Make = Make || jobCard.Make;
        jobCard.HP = HP || jobCard.HP;
        jobCard.KVA = KVA || jobCard.KVA;
        jobCard.RPM = RPM || jobCard.RPM;
        jobCard.Type = Type || jobCard.Type;
        jobCard.Frame = Frame || jobCard.Frame;
        jobCard.SrNo = SrNo || jobCard.SrNo;
        jobCard.DealerName = DealerName || jobCard.DealerName;
        jobCard.DealerNumber = DealerNumber || jobCard.DealerNumber;
        jobCard.works = works || jobCard.works;
        jobCard.spares = spares || jobCard.spares;
        jobCard.industrialworks = industrialworks || jobCard.industrialworks;
        jobCard.attachments = attachments || jobCard.attachments;
        jobCard.warranty = warranty || jobCard.warranty;
        jobCard.jobCardStatus = jobCardStatus || jobCard.jobCardStatus;
        jobCard.others = others || jobCard.others;

        // Save updated job card
        await jobCard.save();

        return res.status(200).json({ message: "Job card updated successfully", success: true, data: jobCard });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getCreatedJobTaskById = async (req: Request, res: Response): Promise<any> => {
    // console.log("hi mone");

    const { id } = req.params;
    try {
        const jobTask = await JobCard.findOne({ jobCardStatus: "Created", _id: new mongoose.Types.ObjectId(id) });
        return res.status(200).json({ message: "Job tasks fetched successfully", success: true, data: jobTask });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const getJobcardById = async (req: Request, res: Response): Promise<any> => {
    // console.log("hi mone");

    const { id } = req.params;
    try {
        const jobTask = await JobCard.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate([
            { path: "images", select: "image" },
            { path: "worker", select: "workerName workerImage" }
        ])
        return res.status(200).json({ message: "Job tasks fetched successfully", success: true, data: jobTask });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}


export const AddImagesToJobCard = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        console.log(id);

        const jobcard = await JobCard.findById(id);
        // console.log("jobcard.............................:", jobcard);

        if (!jobcard) {
            return res.status(400).json({ message: "Job card not found" });
        }
        console.log(req.files);

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: "No files provided" });
        }
        const result = await handleMultipleFileUploads(req, req.files);
        if (!result.success) {
            return res.status(400).json({ message: "upload unsuccessfull" });
        }
        let ids = [];
        for (const ele of result.uploadData || []) {
            console.log("File URL:", ele.url, "Key:", ele.key);
            const jobcardimage = await JobCardImage.create({
                image: ele.url,
                key: ele.key,
                jobCardId: jobcard._id,
            });
            ids.push(new Types.ObjectId(jobcardimage._id));
        }
        jobcard.jobCardStatus = "Pending";
        jobcard.images = ids;
        await jobcard.save();
        return res.status(200).json({ msg: "Uploaded successfull", success: true })
    } catch (error) {

        console.log("Error at upload", error);
        return res.status(500).json({ msg: "Error while uploading image", success: false })

    }
}


export const skipImageUpload = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        console.log(id);

        const jobcard = await JobCard.findById(id);
        // console.log("jobcard.............................:", jobcard);

        if (!jobcard) {
            return res.status(400).json({ message: "Job card not found" });
        }


        jobcard.jobCardStatus = "Pending";
        await jobcard.save();
        return res.status(200).json({ msg: "Skipped successfull", success: true })
    } catch (error) {

        console.log("Error at upload", error);
        return res.status(500).json({ msg: "Error while skipping image", success: false })

    }
}


export const getPendingTasks = async (req: Request, res: Response): Promise<any> => {
    console.log("hi");

    try {
        const pageNo: number = parseInt(req.query.page as string) || 1; // Default to page 1
        const limitOf: number = parseInt(req.query.limit as string) || 10; // Default to limit 10

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }

        const skip: number = (pageNo - 1) * limitOf; // Calculate the number of documents to skip

        const jobTasks = await JobCard.find({ jobCardStatus: "Pending" })
            .skip(skip)
            .limit(limitOf).populate("worker", "workerImage workerName")
            .lean(); // Use lean for better performance if you don't need Mongoose documents

        // Optionally, get the total count of pending tasks
        const countOfDocuments = await JobCard.countDocuments({ jobCardStatus: "Pending" });

        return res.status(200).json({
            message: "Job tasks fetched successfully",
            success: true,
            data: jobTasks,
            totalCount: countOfDocuments, // Include total count in the response
            currentPage: pageNo,
            totalPages: Math.ceil(countOfDocuments / limitOf), // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const getReturnedTasks = async (req: Request, res: Response): Promise<any> => {
    // console.log("hi");

    try {
        const pageNo: number = parseInt(req.query.page as string) || 1; // Default to page 1
        const limitOf: number = parseInt(req.query.limit as string) || 10; // Default to limit 10

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }

        const skip: number = (pageNo - 1) * limitOf; // Calculate the number of documents to skip

        const jobTasks = await JobCard.find({ jobCardStatus: "Returned" })
            .skip(skip)
            .limit(limitOf).populate("worker", "workerImage workerName")
            .lean(); // Use lean for better performance if you don't need Mongoose documents

        // Optionally, get the total count of pending tasks
        const countOfDocuments = await JobCard.countDocuments({ jobCardStatus: "Returned" });

        return res.status(200).json({
            message: "Job tasks fetched successfully",
            success: true,
            data: jobTasks,
            totalCount: countOfDocuments, // Include total count in the response
            currentPage: pageNo,
            totalPages: Math.ceil(countOfDocuments / limitOf), // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const getCompleted = async (req: Request, res: Response): Promise<any> => {
    // console.log("hi");

    try {
        const pageNo: number = parseInt(req.query.page as string) || 1; // Default to page 1
        const limitOf: number = parseInt(req.query.limit as string) || 10; // Default to limit 10

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }

        const skip: number = (pageNo - 1) * limitOf; // Calculate the number of documents to skip

        const jobTasks = await JobCard.find({ jobCardStatus: "Completed" })
            .skip(skip)
            .limit(limitOf).populate("worker", "workerImage workerName")
            .lean(); // Use lean for better performance if you don't need Mongoose documents

        // Optionally, get the total count of pending tasks
        const countOfDocuments = await JobCard.countDocuments({ jobCardStatus: "Completed" });

        return res.status(200).json({
            message: "Job tasks fetched successfully",
            success: true,
            data: jobTasks,
            totalCount: countOfDocuments, // Include total count in the response
            currentPage: pageNo,
            totalPages: Math.ceil(countOfDocuments / limitOf), // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}
export const getBilled = async (req: Request, res: Response): Promise<any> => {
    // console.log("hi");

    try {
        const pageNo: number = parseInt(req.query.page as string) || 1; // Default to page 1
        const limitOf: number = parseInt(req.query.limit as string) || 10; // Default to limit 10

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }

        const skip: number = (pageNo - 1) * limitOf; // Calculate the number of documents to skip

        const jobTasks = await JobCard.find({ jobCardStatus: "Billed" })
            .skip(skip)
            .limit(limitOf).populate("worker", "workerImage workerName")
            .lean(); // Use lean for better performance if you don't need Mongoose documents

        // Optionally, get the total count of pending tasks
        const countOfDocuments = await JobCard.countDocuments({ jobCardStatus: "Billed" });

        return res.status(200).json({
            message: "Job tasks fetched successfully",
            success: true,
            data: jobTasks,
            totalCount: countOfDocuments, // Include total count in the response
            currentPage: pageNo,
            totalPages: Math.ceil(countOfDocuments / limitOf), // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}



export const returnJobcard = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "No id found, id is required", success: false })
        }
        const jobTask = await JobCard.findById(id);
        if (!jobTask) {
            return res.status(400).json({ message: "No jobCard found , recheck or reload the page", success: false })
        }
        jobTask.jobCardStatus = "Returned";
        await jobTask.save({});
        return res.status(200).json({ message: "successfuly returned the jobcard", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}


export const workDoneJobcard = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.query?.id;

        if (!id) {
            return res.status(400).json({ message: "No id found, id is required", success: false })
        }
        const jobTask = await JobCard.findById(id);
        if (!jobTask) {
            return res.status(400).json({ message: "No jobCard found , recheck or reload the page", success: false })
        }
        jobTask.jobCardStatus = "Completed";
        jobTask.OutDate = new Date(Date.now());
        await jobTask.save();
        return res.status(200).json({ message: "Jobcard work finished successfully", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}
export const billJobCard = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.query?.id;
        const invoiceNumber = req.query?.invoiceNumber as string;
        if (!id || !invoiceNumber) {
            return res.status(400).json({ message: "No id found, id is required", success: false })
        }
        const jobTask = await JobCard.findById(id);
        if (!jobTask) {
            return res.status(400).json({ message: "No jobCard found , recheck or reload the page", success: false })
        }
        jobTask.jobCardStatus = "Billed";
        jobTask.invoiceDate = new Date(Date.now());
        jobTask.invoiceNumber = invoiceNumber;
        await jobTask.save();
        return res.status(200).json({ message: "Jobcard work finished successfully", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}





export const SearhJobCard = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page, limit, warranty, searchTerm, returned, pending, completed, billed } = req.query;
        let search = searchTerm ? searchTerm : ""
        let pageNo: number = parseInt(page as string) || 1;
        let limitOf: number = parseInt(limit as string) || 10;
        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }
        let skip: number = (pageNo - 1) * limitOf;


        let query: any = {
            $or: [
                { customerName: { $regex: search, $options: "i" } }, // case-insensitive
                { phoneNumber: { $regex: search, $options: "i" } },
                { jobCardNumber: { $regex: search, $options: "i" } },
                { DealerName: { $regex: search, $options: "i" } },
                { Make: { $regex: search, $options: "i" } },
                { SrNo: { $regex: search, $options: "i" } },
            ]
        }
        if (!isNaN(Number(search))) {
            const searchValue = Number(search);
            query.$or.push({ HP: searchValue });
            query.$or.push({ KVA: searchValue });
            query.$or.push({ RPM: searchValue });
        }
        if (warranty !== undefined) {
            query.warranty = warranty === 'true'; // Convert string 'true'/'false' to boolean
            console.log(warranty);

        }
        if (returned !== undefined) {
            query.jobCardStatus = "Returned";
        }
        if (pending !== undefined) {
            query.jobCardStatus = "Pending"
        }
        if (completed !== undefined) {
            query.jobCardStatus = "Completed"
        }
        if (billed !== undefined) {
            query.jobCardStatus = "Billed"
        }

        const JobCards = await JobCard.find(query).sort({ createdAt: -1 }).populate([{ path: "images", select: "image" },
        { path: "worker", select: "workerName workerImage" }]).skip(skip).limit(limitOf).lean();
        const processedJobCards = JobCards.map(jobCard => {
            return {
                ...jobCard,
                images: jobCard.images ? jobCard.images : null
            };
        });
        const countOfDocuments = await JobCard.countDocuments(query);
        let totalPages = Math.ceil(countOfDocuments / limitOf) // Calculate total pages

        return res.status(200).json({ message: "Successfully fetched", data: processedJobCards, success: true, countOfDocuments, totalPages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}


export const listAllJobCard = async (req: Request, res: Response): Promise<any> => {
    const { limit, page } = req.query;
    try {
        const limitOf: number = parseInt(limit as string) || 10;
        const pageNo: number = parseInt(page as string) || 10;

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            return res.status(400).json({ message: "Invalid page or limit value", success: false });
        }
        let skip: number = (pageNo - 1) * limitOf;

        const jobcards = await JobCard.find().skip(skip).limit(limitOf).populate({ path: "images", select: "image" }).lean();
        const countOfDocuments = await JobCard.countDocuments();


        if (jobcards) {
            return res.status(200).json({
                message: "Job tasks fetched successfully",
                success: true,
                data: jobcards,
                totalCount: countOfDocuments, // Include total count in the response
                currentPage: pageNo,
                totalPages: Math.ceil(countOfDocuments / limitOf), // Calculate total pages
            });
        } else {
            return res.status(400).json({ message: "something went wrong", success: false })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}


export const reports = async (req: Request, res: Response): Promise<any> => {
    try {
        // Define all possible statuses
        const allStatuses = ["Created", "Pending", "Returned", "Completed"];

        // Use aggregation to get counts for existing statuses
        const statusCounts = await JobCard.aggregate([
            {
                $group: {
                    _id: "$jobCardStatus", // Group by jobCardStatus
                    count: { $sum: 1 },    // Count the number of documents
                },
            },
        ]);

        // Transform the aggregation result into an object for easier merging
        const countsMap: Record<string, number> = statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Ensure all statuses are included, defaulting to 0 for missing ones
        const finalCounts = allStatuses.map(status => ({
            status,
            count: countsMap[status] || 0,
        }));

        // Send the counts as a response
        return res.status(200).json({
            message: "Job card status counts fetched successfully",
            success: true,
            data: finalCounts,
        });
    } catch (error) {
        console.error("Error fetching job card status counts:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

