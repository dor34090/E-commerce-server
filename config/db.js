const mongoose = require("mongoose");
const config = require("./keys");
const db = config.mongoURI;

const connectDB = async () =>
{
    try {
        await mongoose.connect(db), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreatedIndex: true,
            useFindAndModify: false,
        };
        console.log("connected to db");
    }catch(err) {
        console.log("connnection failed");
        process.exit(1);
    }
};

module.exports= connectDB;