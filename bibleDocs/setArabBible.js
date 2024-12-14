const fs = require("fs");
const readline = require("readline");

// File paths
const inputFile = "bible.txt";
const outputFile = "bible.json";
const skippedLinesFile = "skipped_lines.txt"; // File to log skipped lines

// Create streams
const fileStream = fs.createReadStream(inputFile);
const outputStream = fs.createWriteStream(outputFile);
const skippedLinesStream = fs.createWriteStream(skippedLinesFile, { flags: 'a' }); // Append mode
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

// Write the beginning of the JSON array
outputStream.write("[");

let firstLine = true;

// Process each line
rl.on("line", (line) => {
  if (!line.trim()) return; // Skip empty lines

  try {
    // Regular expression to separate reference (book chapter:verse) and the verse text
    const regex = /^([A-Za-z]+\s\d+:\d+)\s+(.*)$/;
    const match = line.match(regex);

    if (!match) {
      // Log skipped line to a separate file
      skippedLinesStream.write(line + "\n");
      console.error(`Skipping invalid line: ${line}`);
      return; // Skip lines that don't match the expected format
    }

    const reference = match[1];
    const verseText = match[2].trim();

    // Parse the reference into book, chapter, and verse
    const [book, chapterVerse] = reference.split(" ", 2);
    const [chapter, verse] = chapterVerse.split(":").map(Number);

    // Create JSON object for the current verse
    const verseData = {
      book,
      chapter,
      verse,
      text: verseText,
    };

    // Write to the output stream
    if (!firstLine) {
      outputStream.write(",\n"); // Separate objects with a comma
    }
    outputStream.write(JSON.stringify(verseData, null, 2));
    firstLine = false;
  } catch (error) {
    console.error(`Error processing line: ${line}`);
  }
});

// When the file is completely read, close the JSON array
rl.on("close", () => {
  outputStream.write("]");
  outputStream.end();
  skippedLinesStream.end(); // Close the skipped lines file
  console.log(`Transformation complete! JSON saved to ${outputFile}`);
  console.log(`Skipped lines saved to ${skippedLinesFile}`);
});
