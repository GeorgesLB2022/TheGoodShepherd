const mongoose = require('mongoose');
const fs = require('fs');
const NewBibleVerse = require('../models/newBibleVerseModel');
const express = require('express');
const app = express();
require("dotenv").config({ path: "../.env" });

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

// Arabic Book Names Mapping
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

// Array of books starting from "متى" (Matthew)
const booksFromMatthew = [
    'متى', 'مرقس', 'لوقا', 'يوحنا', 'أعمال الرسل', 'رومية', 'كورنثوس الأولى', 
    'كورنثوس الثانية', 'غلاطية', 'أفسس', 'فيلبي', 'كولوسي', 'تسالونيكي الأولى',
    'تسالونيكي الثانية', 'تيموثاوس الأولى', 'تيموثاوس الثانية', 'تيطس', 'فليمون',
    'العبرانيين', 'يعقوب', 'بطرس الأولى', 'بطرس الثانية', 'يوحنا الأولى', 
    'يوحنا الثانية', 'يوحنا الثالثة', 'يهوذا', 'رؤيا يوحنا'
];

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

            // Filter Bible data to include only books from "متى" (Matthew) onwards
            const filteredBible = originalBible.filter((verseData) => {
                const [bookCode] = verseData.reference.split(' ');
                const arabicBookName = bookNamesMapping[bookCode];
                return booksFromMatthew.includes(arabicBookName); // Check if book is in the list
            });

            // Function to transform and upload the data
            const uploadBibleData = async () => {
                const promises = filteredBible.map(async (verseData) => {
                    const [bookCode, chapterAndVerse] = verseData.reference.split(' ');
                    const [chapter, verseNumber] = chapterAndVerse.split(':');

                    const arabicBookName = bookNamesMapping[bookCode] || bookCode;
                    const arabicChapter = convertToArabicNumerals(chapter);
                    const arabicVerseNumber = convertToArabicNumerals(verseNumber);
                    const arabicReference = `${arabicBookName} ${arabicChapter} : ${arabicVerseNumber}`;

                    const newVerse = new NewBibleVerse({
                        book: arabicBookName,
                        chapter: parseInt(chapter, 10),
                        verse: verseData.verse,
                        reference: arabicReference,
                        theme: arabicBookName,
                        language: verseData.language || 'ar',
                        description: verseData.description || '',
                    });

                    try {
                        await newVerse.save();
                        console.log(`Successfully saved verse: ${arabicReference}`);
                    } catch (error) {
                        console.error('Error saving verse:', error);
                    }
                });

                await Promise.all(promises);
                console.log('Finished uploading all Bible verses.');
            };

            uploadBibleData();
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
