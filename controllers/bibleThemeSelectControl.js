const { MongoClient } = require('mongodb');
const natural = require('natural');
const tf = require('@tensorflow/tfjs-node');
const tfidf = new natural.TfIdf();

// MongoDB setup
const uri = "mongodb://localhost:27017"; // Change to your MongoDB connection string
const dbName = "your-database-name"; // Replace with your actual database name
const collectionName = "newbibleverse"; // Collection containing the verses

// Tokenizer and stopword removal (for English)
const tokenizer = new natural.WordTokenizer();
const stopwords = new Set(natural.stopwords); // English stopwords

// Arabic normalization function
const normalizeArabic = (text) => {
  return text
    .replace(/[ًٌٍَُِْ]/g, '') // Remove diacritics
    .replace(/أ|إ|آ/g, 'ا') // Normalize alef
    .replace(/ة/g, 'ه')  // Normalize ta marbuta
    .replace(/[^\w\s]/g, ''); // Remove punctuation
};

// Function to preprocess a verse
const preprocessVerse = (verse, language) => {
  // Fix encoding issues in the verse text
  verse = verse.replace(/â€œ/g, '"').replace(/â€/g, '"').replace(/â€™/g, "'").replace(/â€“/g, '-');

  if (!verse || typeof verse !== 'string') {
    console.warn('Invalid or missing verse:', verse);
    return ''; // Return an empty string for missing/invalid verses
  }

  if (language === 'English') {
    const tokens = tokenizer.tokenize(verse.toLowerCase());
    return tokens.filter((word) => !stopwords.has(word)).join(' ');
  } else if (language === 'Arabic') {
    return normalizeArabic(verse);
  }

  return verse; // Return the original text if no processing is needed
};

// Load the trained model
const loadModel = async () => {
  try {
    const model = await tf.loadLayersModel('file://./trained-model/model.json');
    console.log('Model loaded successfully.');
    return model;
  } catch (error) {
    console.error('Error loading model:', error.message);
    throw error;
  }
};

// Endpoint to predict the theme of a given verse
const predictTheme = async (verse) => {
  try {
    // Preprocess the input verse
    const processedVerse = preprocessVerse(verse, 'English'); // Adjust language as needed
    
    // TF-IDF Vectorization for the input verse
    tfidf.addDocument(processedVerse);
    const tfidfVector = tfidf.listTerms(tfidf.documents.length - 1).map((term) => term.tfidf);

    // Ensure the input vector matches the model's expected input size
    const vectorLength = 100; // Adjust this to match the vector length used in training
    const inputVector = tfidfVector.concat(Array(vectorLength - tfidfVector.length).fill(0));

    // Convert to tensor
    const inputTensor = tf.tensor2d([inputVector], [1, vectorLength], 'float32');

    // Load the trained model
    const model = await loadModel();

    // Make a prediction
    const prediction = model.predict(inputTensor);
    const predictedIndex = prediction.argMax(-1).dataSync()[0];

    // Get the theme corresponding to the predicted index
    const uniqueThemes = ['Theme1', 'Theme2', 'Theme3']; // Replace with your actual themes
    const predictedTheme = uniqueThemes[predictedIndex];

    return predictedTheme;
  } catch (error) {
    console.error('Error during prediction:', error.message);
    return 'Error in prediction';
  }
};

// Function to process and bulk update themes
const processAndUpdateThemes = async () => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch verses from MongoDB
    const verses = await collection.find({}).toArray(); // Get all verses from the collection

    // Array to hold bulk write operations
    const bulkOps = [];

    for (const verse of verses) {
      const { _id, verseText, theme } = verse; // Assuming 'verseText' contains the verse text

      if (!verseText) {
        console.warn('Skipping verse with missing text:', verse);
        continue;
      }

      // Predict the theme for the verse
      const predictedTheme = await predictTheme(verseText);

      // Create an update operation for the bulk operation
      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { $set: { theme: predictedTheme } },
          upsert: false // Do not insert if the document does not exist
        }
      });
    }

    // Execute the bulk write operation
    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} verses.`);
    } else {
      console.log('No verses were processed for update.');
    }
  } catch (error) {
    console.error('Error during bulk update:', error.message);
  } finally {
    await client.close();
  }
};

// Start the process
processAndUpdateThemes();
