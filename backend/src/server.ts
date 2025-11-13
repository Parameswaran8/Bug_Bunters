import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const PORT = parseInt(process.env.PORT || "5500", 10); // Ensure PORT is a number
const MONGO_URI = `${process.env.MONGO_URI}` || "";

app.get('/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ message: 'Server is working!' });
});

try {
    app.listen(PORT, "0.0.0.0" , async () => {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error("MongoDB connection failed:", error);
}