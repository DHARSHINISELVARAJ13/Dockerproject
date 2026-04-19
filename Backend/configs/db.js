import mongoose  from "mongoose";

const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected',()=> console.log('Database Connected')
        )
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error("MongoDB URI is missing. Set MONGODB_URI or MONGO_URI in environment variables.");
}

const hasDbInUri = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(mongoUri);
const connectionUri = hasDbInUri ? mongoUri : `${mongoUri.replace(/\/$/, "")}/quickblog`;

await mongoose.connect(connectionUri)
    }catch(error){
console.log(error.message);
    }
}
export default connectDB;