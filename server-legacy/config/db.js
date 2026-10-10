const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected ${connectionInstance.connection.host}`);
    }
    catch(error) {
        console.log("Mongodb Connection Error", error);
        process.exit(1)
    }
    
}

module.exports = connectDB