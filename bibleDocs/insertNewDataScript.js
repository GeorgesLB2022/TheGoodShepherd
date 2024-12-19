//require("dotenv").config();
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const NewBibleVerse = require("../models/newBibleVerseModel");

const express = require("express");

const app = express();

const MONGO_URL = process.env.MONGO_URL || ""; // Fallback to an empty string
const PORT = process.env.PORT || 3000;

if (!MONGO_URL) {
    console.error("Error: MONGO_URL is not defined. Please check your .env file.");
    process.exit(1); // Exit the process to prevent further errors
  }

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("connected to mongodb");
    app.listen(PORT, () => {
      console.log(`Node API app is running on port ${PORT}`);
      importData();
    });
  })
  .catch((error) => {
    console.log(error);
  });

// List of books starting from "Matthew" onward
const allowedBooks = [
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1Corinthians",
  "2Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1Thessalonians",
  "2Thessalonians",
  "1Timothy",
  "2Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1Peter",
  "2Peter",
  "1John",
  "2John",
  "3John",
  "Jude",
  "Revelation",
];

// Function to Import Data
async function importData() {
  try {
    // Read and Parse the JSON file
    const data = JSON.parse(fs.readFileSync("nabre.json", "utf-8"));

    // Transform Data
    const verses = [];
    data.forEach((book, bookIndex) => {
      // Check if the book is within the allowed list
      if (allowedBooks.includes(book.book)) {
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
      } else {
        console.log(`Skipped book: ${book.book}`);
      }
    });
    console.log("Data transformation complete. Inserting into database...");

    // Insert Data into MongoDB
    const BATCH_SIZE = 1000; // Number of documents to insert at once
    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
      const batch = verses.slice(i, i + BATCH_SIZE);
      await NewBibleVerse.insertMany(batch);
    }
    console.log("Data successfully imported!");

    // Close the Database Connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error importing data:", err);
    mongoose.connection.close();
  }
}
