const { MongoClient } = require('mongodb');
const natural = require('natural');
const tf = require('@tensorflow/tfjs-node');
const tfidf = new natural.TfIdf();

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
  if (!verse || typeof verse !== 'string') {
    console.warn('Invalid or missing verse:', verse);
    return ''; // Return an empty string for missing/invalid verses
  }

  // Normalize and clean the verse
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

// TF-IDF Vectorization for the input verse
const preprocessVerseForPrediction = (verse) => {
  tfidf.addDocument(verse);
  const tfidfVector = tfidf.listTerms(tfidf.documents.length - 1).map((term) => term.tfidf);

  // Ensure the vector has exactly 19 features (pad or truncate)
  const vectorLength = 19; // Model expects 19 features
  const inputVector = tfidfVector.slice(0, vectorLength).concat(Array(Math.max(0, vectorLength - tfidfVector.length)).fill(0));

  return inputVector;
};

// Endpoint to predict the theme of a given verse
const predictTheme = async (verse, language) => {
  try {
    // Preprocess the input verse
    const processedVerse = preprocessVerse(verse, language);
    const inputVector = preprocessVerseForPrediction(processedVerse);

    // Convert to tensor
    const inputTensor = tf.tensor2d([inputVector], [1, 19], 'float32'); // Adjusted input shape to [1, 19]

    // Load the trained model
    const model = await loadModel();

    // Make a prediction
    const prediction = model.predict(inputTensor);
    const predictedIndex = prediction.argMax(-1).dataSync()[0];

    console.log(`Predicted Index: ${predictedIndex}`); // Log the predicted index for debugging

    // Get the theme corresponding to the predicted index
    const uniqueThemesEnglish = [
      'Love and Compassion', 'Faith and Trust', 'Hope and Encouragement', 
      'Fear and Courage', 'Forgiveness and Mercy', 'Strength and Resilience', 
      'Wisdom and Guidance', 'Peace and Rest', 'Purpose and Calling', 
      'Gratitude and Praise', 'Healing and Comfort', 'Joy and Celebration', 
      'Justice and Righteousness', 'Obedience and Faithfulness', 
      'Patience and Perseverance', 'Provision and Abundance', 
      'Humility and Surrender', 'Unity and Fellowship', 
      'Protection and Safety', 'Eternal Life and Salvation'
    ];
    const uniqueThemesArabic = [
      'المحبة والرحمة', 'الإيمان والثقة', 'الرجاء والتشجيع', 
      'الخوف والشجاعة', 'الغفران والرحمة', 'القوة والمرونة', 
      'الحكمة والإرشاد', 'السلام والراحة', 'الهدف والدعوة', 
      'الشكر والتسبيح', 'الشفاء والتعزية', 'الفرح والاحتفال', 
      'العدالة والبر', 'الطاعة والأمانة', 'الصبر والمثابرة', 
      'الرزق والوفرة', 'التواضع والخضوع', 'الوحدة والشركة', 
      'الحماية والأمان', 'الحياة الأبدية والخلاص'
    ];

    const uniqueThemes = language === 'English' ? uniqueThemesEnglish : uniqueThemesArabic;

    if (predictedIndex >= 0 && predictedIndex < uniqueThemes.length) {
      return uniqueThemes[predictedIndex];
    } else {
      console.warn('Predicted index is out of bounds:', predictedIndex);
      return 'Unknown Theme'; // Fallback for invalid index
    }
  } catch (error) {
    console.error('Error during prediction:', error.message);
    return 'Error in prediction';
  }
};

// Test function for both English and Arabic verses
const testPrediction = async () => {
  const englishVerse = "“Behold, the virgin shall be with child and bear a son, and they shall name him Emmanuel,” which means “God is with us.”";
  const arabicVerse = "وَأُوصِيكُمْ أَنْ تَحِبُّوا بَعْضُكُمْ بَعْضًا كَمَا أَحْبَبْتُكُمْ.";

  console.log('\nTesting English Verse...');
  const predictedEnglishTheme = await predictTheme(englishVerse, 'English');
  console.log(`Input Verse (English): "${englishVerse}"`);
  console.log(`Predicted Theme (English): ${predictedEnglishTheme}`);

  console.log('\nTesting Arabic Verse...');
  const predictedArabicTheme = await predictTheme(arabicVerse, 'Arabic');
  console.log(`Input Verse (Arabic): "${arabicVerse}"`);
  console.log(`Predicted Theme (Arabic): ${predictedArabicTheme}`);
};

// Test the model with both verses
testPrediction();
