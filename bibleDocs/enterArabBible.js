const mongoose = require('mongoose');
const fs = require('fs');
const BibleVerse = require('../models/bibleVerseModel');
const express = require('express')
const app = express()
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT

// Arabic Book Names Mapping (just an example, expand this as needed)
const bookNamesMapping = {
    'GN': 'التكوين',          // Genesis
    'EX': 'الخروج',          // Exodus
    'LV': 'اللاويين',         // Leviticus
    'NM': 'العدد',           // Numbers
    'DT': 'التثنية',         // Deuteronomy
    'JS': 'يشوع',            // Joshua
    'JUD': 'القضاة',          // Judges
    'RT': 'راعوث',           // Ruth
    '1SM': 'صموئيل الأول',    // 1 Samuel
    '2SM': 'صموئيل الثاني',   // 2 Samuel
    '1KGS': 'الملوك الأول',    // 1 Kings
    '2KGS': 'الملوك الثاني',   // 2 Kings
    '1CH': 'أخبار الأيام الأول', // 1 Chronicles
    '2CH': 'أخبار الأيام الثاني', // 2 Chronicles
    'EZR': 'عزرا',            // Ezra
    'NE': 'نحميا',           // Nehemiah
    'ET': 'استير',           // Esther
    'JOB': 'أيوب',            // Job
    'PS': 'المزامير',          // Psalms
    'PRV': 'الأمثال',           // Proverbs
    'EC': 'الجامعة',           // Ecclesiastes
    'SO': 'نشيد الأنشاد',      // Song of Solomon
    'IS': 'إشعياء',           // Isaiah
    'JR': 'إرميا',            // Jeremiah
    'LM': 'مراثي إرميا',       // Lamentations
    'EZ': 'حزقيال',           // Ezekiel
    'DN': 'دانيال',           // Daniel
    'HO': 'هوشع',             // Hosea
    'JL': 'يوئيل',            // Joel
    'AM': 'عاموس',            // Amos
    'OB': 'عوبديا',            // Obadiah
    'JN': 'يونان',             // Jonah
    'MI': 'ميخا',             // Micah
    'NA': 'ناحوم',            // Nahum
    'HK': 'حبقوق',            // Habakkuk
    'ZP': 'صفنيا',            // Zephaniah
    'HG': 'حجى',              // Haggai
    'ZC': 'زكريا',            // Zechariah
    'ML': 'ملاخي',            // Malachi
    'MT': 'متى',              // Matthew
    'MK': 'مرقس',             // Mark
    'LK': 'لوقا',              // Luke
    'JO': 'يوحنا',             // John
    'ACT': 'أعمال الرسل',      // Acts
    'RM': 'رومية',            // Romans
    '1CO': 'كورنثوس الأولى',   // 1 Corinthians
    '2CO': 'كورنثوس الثانية',  // 2 Corinthians
    'GL': 'غلاطية',           // Galatians
    'EPH': 'أفسس',             // Ephesians
    'PH': 'فيلبي',            // Philippians
    'CL': 'كولوسي',           // Colossians
    '1TS': 'تسالونيكي الأولى', // 1 Thessalonians
    '2TS': 'تسالونيكي الثانية',// 2 Thessalonians
    '1TM': 'تيموثاوس الأولى',  // 1 Timothy
    '2TM': 'تيموثاوس الثانية', // 2 Timothy
    'TT': 'تيطس',             // Titus
    'PHM': 'فليمون',           // Philemon
    'HB': 'العبرانيين',        // Hebrews
    'JM': 'يعقوب',            // James
    '1PE': 'بطرس الأولى',      // 1 Peter
    '2PE': 'بطرس الثانية',     // 2 Peter
    '1JO': 'يوحنا الأولى',     // 1 John
    '2JO': 'يوحنا الثانية',    // 2 John
    '3JO': 'يوحنا الثالثة',    // 3 John
    'JD': 'يهوذا',           // Jude
    'RE': 'رؤيا يوحنا',        // Revelation
  };
  

// Function to convert English numbers to Arabic numbers
function convertToArabicNumerals(number) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
      .toString()
      .split('')
      .map((digit) => arabicNumerals[parseInt(digit, 10)] || digit)
      .join('');
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
          console.log(`Node API app is running on port ${PORT}`);
      });

      // Read the JSON file containing the Bible data
      fs.readFile('transformedBible.json', 'utf8', async (err, data) => {
          if (err) {
              console.error('Error reading the JSON file:', err);
              return;
          }

          const originalBible = JSON.parse(data);

          // Function to transform and upload the data
          // Function to transform and upload the data
const uploadBibleData = async () => {
  const promises = originalBible.map(async (verseData) => {
      // Extract the English book name, chapter, and verse from the "reference" field
      const [bookCode, chapterAndVerse] = verseData.reference.split(' ');
      const [chapter, verseNumber] = chapterAndVerse.split(':');

      // Get the Arabic book name
      const arabicBookName = bookNamesMapping[bookCode] || bookCode;

      // Convert chapter and verse numbers to Arabic numerals
      const arabicChapter = convertToArabicNumerals(chapter);
      const arabicVerseNumber = convertToArabicNumerals(verseNumber);

      // Create the Arabic reference (e.g., التكوين ١:١)
      const arabicReference = `${arabicBookName} ${arabicChapter}:${arabicVerseNumber}`;

      // Create a new BibleVerse document
      const newVerse = new BibleVerse({
          book: arabicBookName,                   // Arabic book name
          chapter: parseInt(chapter, 10),        // Chapter as a number
          verse: verseData.verse,                // Original verse text in Arabic
          reference: arabicReference,            // Arabic-formatted reference
          theme: arabicBookName,                 // Use Arabic book name as theme
          language: verseData.language || 'ar',  // Default language to Arabic
          description: verseData.description || '', // Any provided description
      });

      try {
          // Save to MongoDB
          await newVerse.save();
          console.log(`Successfully saved verse: ${arabicReference}`);
      } catch (error) {
          console.error('Error saving verse:', error);
      }
  });

  // Wait for all promises to complete
  await Promise.all(promises);
  console.log('Finished uploading all Bible verses.');
};


          // Start uploading the Bible data
          uploadBibleData();
      });
  })
  .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
  });
