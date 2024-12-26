import express from "express";
import { dbConnect } from "./db/dbConfig";
import authRouter from "./routes/authRoutes";
import dotenv from "dotenv";
import jobcardRouter from "./routes/jobCardRoutes";
import searchRouter from "./routes/searchRoutes";
import workerRouter from "./routes/workerRoutes";
import analysisRouter from "./routes/analysisRoutes";
import cors from "cors";



dotenv.config({ path: "./.env" });
const app = express();


app.use(cors({
    origin: "*"
}))
app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).json({
        message: "server is running"
    })
})

app.use("/api/auth", authRouter);
app.use("/api/jobcard", jobcardRouter);
app.use("/api/search", searchRouter);
app.use("/api/worker", workerRouter);
app.use("/api/analysis", analysisRouter);

app.get("*", (req, res) => {
    res.sendFile('/var/www/evee/hitech/hitech-frontend/dist/index.html');
});
dbConnect().then(() => {
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    })
})
