const { MongoClient } = require("mongodb");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require('dotenv').config()
const express = require('express')

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT
const FRONTEND = process.env.FRONTEND

const app = express()

// MongoDB connection URI and database details
const uri = MONGO_URL;
const dbName = "GoodShepherd";
const collectionName = "newbibleverses";

async function fetchAndExportRandomVerses() {

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch 100 random verses in English
    const englishVerses = await collection.aggregate([
      { $match: { language: "en" } },
      { $sample: { size: 100 } },
    ]).toArray();

    // Fetch 100 random verses in Arabic
    const arabicVerses = await collection.aggregate([
      { $match: { language: "ar" } },
      { $sample: { size: 100 } },
    ]).toArray();

    // Export English verses to CSV
    const englishCsvWriter = createCsvWriter({
      path: "english_verses_sample.csv",
      header: [
        { id: "verse", title: "Verse" },
        { id: "reference", title: "Reference" },
        { id: "theme", title: "Theme" }, // For labeling later
      ],
    });
    await englishCsvWriter.writeRecords(englishVerses);
    console.log("English verses exported to english_verses_sample.csv");

    // Export Arabic verses to CSV
    const arabicCsvWriter = createCsvWriter({
      path: "arabic_verses_sample.csv",
      header: [
        { id: "verse", title: "Verse" },
        { id: "reference", title: "Reference" },
        { id: "theme", title: "Theme" }, // For labeling later
      ],
    });
    await arabicCsvWriter.writeRecords(arabicVerses);
    console.log("Arabic verses exported to arabic_verses_sample.csv");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

fetchAndExportRandomVerses();
