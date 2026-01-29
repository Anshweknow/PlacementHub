const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/placement-platform", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
