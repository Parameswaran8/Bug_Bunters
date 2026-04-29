import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import mongoose from "mongoose";

import { setupCronJobs } from "./utils/cron";

const PORT = parseInt(process.env.PORT || "5500", 10); // Ensure PORT is a number
const MONGO_URI = `${process.env.MONGO_URI}` || "";

app.get('/test', (_req, res) => {
    console.log('Test endpoint hit!');
    res.json({ message: 'Server is working!' });
});

import { sendDailyReport } from "./utils/cron";

app.get('/test-report', async (_req, res) => {
    console.log('Test report endpoint hit! Sending report...');
    await sendDailyReport();
    res.json({ message: 'Test report sent successfully!' });
});

try {
    app.listen(PORT, "0.0.0.0" , async () => {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        console.log(`Server running on port ${PORT}`);
        
        // Start cron jobs
        setupCronJobs();
        console.log("Cron jobs initialized");
    });
} catch (error) {
    console.error("MongoDB connection failed:", error);
}