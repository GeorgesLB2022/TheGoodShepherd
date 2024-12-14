const mongoose = require('mongoose');
const fs = require('fs');

// Define your BibleVerseSchema based on your provided structure
const BibleVerseSchema = new mongoose.Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: String, required: true },       // The Bible verse
  reference: { type: String, required: true },  // e.g., John 3:16
  theme: { type: String, required: true },      // Theme or category
  language: { type: String, required: true },   // "en" or "ar"
  description: { type: String }                 // Short description or context
}, { timestamps: true });

// Read the original Bible data from a JSON file
fs.readFile('originalBible.json', 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading the JSON file:", err);
    return;
  }

  // Parse the JSON data
  const originalBible = JSON.parse(data);
  const transformedBible = [];

  // Function to remove Left-to-Right Mark (U+200E) characters
  function removeLRM(str) {
    return str.replace(/\u200E/g, '');  // Removes all instances of LRM
  }

  // Function to transform the original structure into the schema
  function transformBible(original) {
    original.forEach(book => {
      const bookAbbrev = book.abbrev;
      book.chapters.forEach((verses, chapterIndex) => {
        verses.forEach((verseText, verseIndex) => {
          // Remove any unwanted LRM characters from the verse
          const cleanedVerseText = removeLRM(verseText);

          const reference = `${bookAbbrev.toUpperCase()} ${chapterIndex + 1}:${verseIndex + 1}`;
          const transformedVerse = {
            book: bookAbbrev.toUpperCase(),
            chapter: chapterIndex + 1,
            verse: cleanedVerseText,
            reference: reference,
            theme: 'Genesis', // You could set a theme dynamically if required
            language: 'ar', // You can set the language dynamically based on your needs
            description: '' // Add any description or context if required
          };

          transformedBible.push(transformedVerse);
        });
      });
    });
  }

  // Call the transformation function
  transformBible(originalBible);

  // Write the transformed Bible data to a new JSON file
  fs.writeFile('transformedBible.json', JSON.stringify(transformedBible, null, 2), (err) => {
    if (err) {
      console.error("Error writing the JSON file:", err);
    } else {
      console.log("Transformed Bible data saved to transformedBible.json");
    }
  });
});
