import { Request, Response } from "express";
import { JobCard } from "../models/jobCardModel";
import Worker from "../models/workerModel";

export const dashBoardRepots = async (req: Request, res: Response): Promise<any> => {
    try {
        const countOfTotalDocs = await JobCard.countDocuments();
        const countOfWorkers = await Worker.countDocuments({ status: true });
        const countOfPenginWorks = await JobCard.countDocuments({ jobCardStatus: "Pending" });

        // Define the start and end of the current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        // Filter JobCards where InDate is within the current month
        const countOfJobcardThisMonth = await JobCard.countDocuments({
            InDate: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });

        // Transform the data to match your frontend structure
        const data = [
            {
                title: "Job Cards This Month",
                count: countOfJobcardThisMonth,
                description: "Number of job cards created this month.",
            },
            {
                title: "Pending Jobs",
                count: countOfPenginWorks,
                description: "Number of pending job cards.",
            },
            {
                title: "Total Job Cards",
                count: countOfTotalDocs,
                description: "Total number of job cards created.",
            },
            {
                title: "Active Workers",
                count: countOfWorkers,
                description: "Total number of active workers.",
            },

        ];

        // Send the response
        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
