const fs = require('fs');
const csv = require('csv-parser');
const natural = require('natural');
const tf = require('@tensorflow/tfjs-node');
const tfidf = new natural.TfIdf();

// Define file paths
const englishFilePath = './Englishverses.csv';
const arabicFilePath = './arabverses.csv';

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

// Read and preprocess CSV
const preprocessCSV = async (filePath, language) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(), // Ensure headers are trimmed and consistent
        })
      )
      .on('data', (data) => {
        const verse = data['Column1']; // Access "Column1" for verses
        if (!verse) {
          console.warn('Skipping row due to missing verse:', data);
          return; // Skip row
        }

        const preprocessedVerse = preprocessVerse(verse, language); // Preprocess the verse
        results.push({
          verse: preprocessedVerse,
          theme: data['Column3'], // Adjust theme column accordingly
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Split data into training and testing sets
const splitData = (X, Y, trainSize = 0.8) => {
  const dataSize = X.length;
  const trainCount = Math.floor(trainSize * dataSize);
  const indices = Array.from(Array(dataSize).keys());
  indices.sort(() => Math.random() - 0.5); // Shuffle the indices

  const X_train = [];
  const Y_train = [];
  const X_test = [];
  const Y_test = [];

  for (let i = 0; i < trainCount; i++) {
    X_train.push(X[indices[i]]);
    Y_train.push(Y[indices[i]]);
  }

  for (let i = trainCount; i < dataSize; i++) {
    X_test.push(X[indices[i]]);
    Y_test.push(Y[indices[i]]);
  }

  return { X_train, Y_train, X_test, Y_test };
};

// Main function
const prepareData = async () => {
  
  try {
    // Preprocess English and Arabic data
    const englishData = await preprocessCSV(englishFilePath, 'English');
    const arabicData = await preprocessCSV(arabicFilePath, 'Arabic');

    // Combine both datasets
    const combinedData = [...englishData, ...arabicData];

    // Extract features (X) and labels (Y)
    const X = combinedData.map((item) => item.verse);
    const Y = combinedData.map((item) => item.theme);

    // Check for mismatched lengths
    if (X.length !== Y.length) {
      throw new Error(`Mismatch between input samples (${X.length}) and target samples (${Y.length}).`);
    }

    console.log('Number of input samples (X):', X.length);
    console.log('Number of target samples (Y):', Y.length);

    // Get unique themes for the output layer
    const uniqueThemes = [...new Set(Y)];
    const themeToIndex = Object.fromEntries(uniqueThemes.map((theme, index) => [theme, index]));

    const Y_indices = Y.map((theme) => themeToIndex[theme]);

    const { X_train, Y_train, X_test, Y_test } = splitData(X, Y_indices);

    // TF-IDF Vectorization
    const tfidfVectors = X_train.map((verse) => {
      tfidf.addDocument(verse);
      return tfidf.listTerms(tfidf.documents.length - 1).map((term) => term.tfidf);
    });

    const vectorLength = Math.max(...tfidfVectors.map((vec) => vec.length));
    const consistentVectors = tfidfVectors.map((vec) =>
      vec.concat(Array(vectorLength - vec.length).fill(0))
    );

    const X_tensor = tf.tensor2d(consistentVectors, undefined, 'float32');
    const Y_tensor = tf.tensor1d(Y_train, 'float32'); // Convert labels to float32

    // Define TensorFlow.js model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [vectorLength] }));
    model.add(tf.layers.dense({ units: uniqueThemes.length, activation: 'softmax' }));

    model.compile({
      optimizer: 'adam',
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    console.log('Training model...');
    await model.fit(X_tensor, Y_tensor, { epochs: 10, batchSize: 32 });

    console.log('Model training complete.');

    // Save the model to a local folder
    const savePath = 'file://./trained-model'; // Path to save the model
    await model.save(savePath);

    console.log('Model saved successfully at:', savePath);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
//console.log('TensorFlow.js version:', tf.version.tfjs);
prepareData();
