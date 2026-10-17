import mongoose from "mongoose";

const connectedDb = async () => {
  try {
    const mongoUri = (process.env.MONGODB_URI || process.env.MANGODB_URI || "mongodb://localhost:27017").trim();
    const dbName = process.env.DB_NAME || "chatApp";
    const connectionString = mongoUri.endsWith("/") ? `${mongoUri}${dbName}` : `${mongoUri}/${dbName}`;

    const connectionInstance = await mongoose.connect(connectionString);

    console.log("Db connected at:", connectionInstance.connection.host);
  } catch (error) {
    console.error("Error in connecting MongoDB:", error);
  }
};

export default connectedDb;
