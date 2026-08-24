import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGO_DB_URI;

    if (!uri) {
        throw new Error("MONGO_DB_URI is not defined. Check your backend/.env file or environment variables.");
    }

    const maxRetries = 5;
    const opts = { serverSelectionTimeoutMS: 10000 };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await mongoose.connect(uri, opts);
            console.log("Connected to MongoDB");
            return;
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, error && error.message ? error.message : error);

            if (attempt === maxRetries) {
                console.error("Max connection attempts reached. Check network/DNS, Atlas cluster state, and IP whitelist (Network Access) in MongoDB Atlas.");
                throw error;
            }

            const backoff = 2000 * attempt;
            console.log(`Retrying MongoDB connection in ${backoff}ms...`);
            await new Promise((res) => setTimeout(res, backoff));
        }
    }
};

export default connectDB;