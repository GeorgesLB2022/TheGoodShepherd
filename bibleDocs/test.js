const fetch = require("node-fetch");

async function testAPI() {
  try {
    const response = await fetch("https://arabic-bible.onrender.com/api/json/books");
    
    if (!response.ok) {
      throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAPI();
