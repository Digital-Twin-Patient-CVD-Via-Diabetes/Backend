import mongoose from "mongoose";
import csvtojson from "csvtojson";
import dotenv from "dotenv";
import Mediciens from "./models/mediciens.model.js"; 

dotenv.config();

const MONGO_URI = 'mongodb+srv://MostafaKhaled:StJ5uCKVnYIEDqEZ@digitalpatienttwin.p520k.mongodb.net/digitaltwin'; 
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const importData = async () => {
  try {
    const medicines = await csvtojson().fromFile("medicine.csv");

    const formattedData = medicines.map((item) => ({
      Medication: item.Medication,
      specialization: item["Primary Disease"],
      Influence: item.Influence,
    }));

    await Mediciens.insertMany(formattedData);

    console.log("Data Imported Successfully ");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error Importing Data ", error);
    mongoose.connection.close();
  }
};


importData();
