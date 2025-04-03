import mongoose from "mongoose";

// const MANGODB_URI = "mongodb+srv://sophans:sophan1234@cluster0.w1yuh.mongodb.net";
const MANGODB_URI = "mongodb://localhost:27017";
const db_name = "chatapp";

const connectedDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${MANGODB_URI}/${db_name}`);

    console.log("Db connected at:", connectionInstance.connection.host);
  } catch (error) {
    console.error("Error in connecting MongoDB:", error);
  }
};

export default connectedDb;
