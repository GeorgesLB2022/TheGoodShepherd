const mongoose = require("mongoose");
const fs = require("fs");
const BibleVerse = require('../models/bibleVerseModel');
require('dotenv').config()
const express = require('express')

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT
const FRONTEND = process.env.FRONTEND

const app = express()

mongoose.
connect(MONGO_URL)
.then(()=>{
    console.log('connected to mongodb')
    app.listen(PORT, ()=> {
        console.log(`Node API app is running on port ${PORT}`)
        importData();
    })    
}).catch((error)=>{
    console.log(error)
})

// Function to Import Data
async function importData() {
  try {
    // Read and Parse the JSON file
    const data = JSON.parse(fs.readFileSync("nabre.json", "utf-8"));

    // Transform Data
    const verses = [];
    data.forEach((book, bookIndex) => {
        book.chapters.forEach((chapter, chapterIndex) => {
          chapter.verses.forEach((verse, verseIndex) => {
            verses.push({
              book: book.book,
              chapter: chapter.chapter,
              verse: verse.text,
              reference: `${book.book} ${chapter.chapter}:${verse.verse}`,
              theme: "General",
              language: "en",
              description: "",
            });
          });
          console.log(`Processed chapter ${chapterIndex + 1} of book ${bookIndex + 1}`);
        });
      });
      console.log("Data transformation complete. Inserting into database...");

    // Insert Data into MongoDB
    const BATCH_SIZE = 1000; // Number of documents to insert at once
    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
      const batch = verses.slice(i, i + BATCH_SIZE);
      await BibleVerse.insertMany(batch);
    }
    console.log("Data successfully imported!");

    // Close the Database Connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error importing data:", err);
    mongoose.connection.close();
  }
}
