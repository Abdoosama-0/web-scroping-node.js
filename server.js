const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.get("/" , (req,res)=>{
  res.json({data:"hello"})
})
app.get("/api/topMovies", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" }); // استخدام وضع Headless الجديد
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto("https://www.imdb.com/chart/top/?ref_=nv_mv_250", { waitUntil: "domcontentloaded" });

    // ✅ تأكد من تحميل الأفلام
    await page.waitForSelector(".ipc-metadata-list-summary-item");

    // ✅ تمرير الصفحة لأسفل لضمان تحميل جميع الأفلام
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));

    // ✅ الانتظار بعد التمرير بطريقة بديلة
    await new Promise(resolve => setTimeout(resolve, 2000));




    // ✅ استخراج بيانات جميع الأفلام
    const movies = await page.evaluate(() => {
      return [...document.querySelectorAll(".ipc-metadata-list-summary-item")].map((movie, index) => {
        const elements = [...movie.querySelectorAll(".URyjV")]; // جلب جميع العناصر ذات الكلاس .URyjV
        return {
        rank: index + 1,
        title: movie.querySelector(".ipc-title__text")?.innerText || "غير متوفر",
        rating: movie.querySelector(".ipc-rating-star--imdb")?.innerText || "غير متوفر",
        year: elements[0]?.innerText.trim() || "غير متوفر", // أول عنصر
        time: elements[1]?.innerText.trim() || "غير متوفر", // ثاني عنصر
        age: elements[2]?.innerText.trim() || "غير متوفر", // ثالث
      
        image: movie.querySelector(".ipc-image")?.src || "",
        link: "https://www.imdb.com" + movie.querySelector("a.ipc-title-link-wrapper")?.getAttribute("href"),
    }
  });
    });
  // more: [...movie.querySelectorAll(".URyjV")]
        // .map(element => element.innerText.trim()) // استخراج النصوص
        // .join(" | ") || "غير متوفر",
    await browser.close();
    res.json({topMovies:movies});
  } catch (error) {
    console.error("❌ خطأ:", error.message);
    res.status(500).json({ error: "فشل في جلب البيانات" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/movies`));






//==========================================================================
// const express = require("express");
// const puppeteer = require("puppeteer");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());

// app.get("/movies", async (req, res) => {
//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/91.0.4472.124 Safari/537.36"
//     );

//     await page.goto("https://www.imdb.com/chart/top/?ref_=nv_mv_250", { waitUntil: "domcontentloaded" });

//     const movies = await page.evaluate(() => {
//       return [...document.querySelectorAll(".ipc-metadata-list-summary-item")].map((movie, index) => ({
//         rank: index + 1,
//         title: movie.querySelector(".ipc-title__text")?.innerText || "غير متوفر",
//         rating: movie.querySelector(".ipc-rating-star--imdb")?.innerText || "غير متوفر",
//         image: movie.querySelector(".ipc-image")?.src || "",
//         link: "https://www.imdb.com" + movie.querySelector("a.ipc-title-link-wrapper")?.getAttribute("href"),
//       }));
//     });

//     await browser.close();
//     res.json(movies);
//   } catch (error) {
//     console.error("❌ خطأ:", error.message);
//     res.status(500).json({ error: "فشل في جلب البيانات" });
//   }
// });

// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/movies`));
