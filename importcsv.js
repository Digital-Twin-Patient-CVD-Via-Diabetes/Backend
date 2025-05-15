
import csv from 'csvtojson';
import mongoose from 'mongoose';
import rangesModel from './models/ranges.model.js'; 
const MONGO_URI = 'mongodb+srv://MostafaKhaled:StJ5uCKVnYIEDqEZ@digitalpatienttwin.p520k.mongodb.net/digitaltwin'; 

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const jsonArray = await csv().fromFile('healthmetrics.csv');
    const result = await rangesModel.insertMany(jsonArray);
    console.log(`${result.length} documents inserted.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
  });
