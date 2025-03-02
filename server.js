const fs = require("fs");
const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

async function fetchMovies() {
    console.log("🔄 جاري تحديث بيانات الأفلام...");

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        await page.goto("https://www.imdb.com/chart/top", { waitUntil: "networkidle2" });

        // ✅ تأكد من أن الأفلام ظهرت في الصفحة
        await page.waitForSelector(".ipc-metadata-list-summary-item", { timeout: 10000 });

        // ✅ استخراج بيانات الأفلام
        const movies = await page.evaluate(() => {
            return [...document.querySelectorAll(".ipc-metadata-list-summary-item")].map((movie, index) => {
                const titleElement = movie.querySelector(".ipc-title__text");
                const ratingElement = movie.querySelector(".ipc-rating-star--imdb");
                const linkElement = movie.querySelector("a.ipc-title-link-wrapper");

                return {
                    rank: index + 1,
                    title: titleElement ? titleElement.innerText.trim() : "غير متوفر",
                    rating: ratingElement ? ratingElement.innerText.trim() : "غير متوفر",
                    link: linkElement ? "https://www.imdb.com" + linkElement.getAttribute("href") : "غير متوفر",
                };
            });
        });

        await browser.close();

        if (movies.length === 0) {
            console.log("❌ لم يتم استخراج أي بيانات! قد يكون هناك خطأ في Selectors.");
        } else {
            console.log(`✅ تم استخراج ${movies.length} فيلم.`);
        }

        fs.writeFileSync("movies.json", JSON.stringify(movies, null, 2));

    } catch (error) {
        console.error("❌ حدث خطأ أثناء جلب الأفلام:", error);
    }
}

// **استدعاء `fetchMovies` عند تشغيل السيرفر**
fetchMovies();

// **تحديث البيانات كل ساعة (3600000 مللي ثانية)**
setInterval(fetchMovies, 3600000);

// **API لجلب الأفلام من `movies.json`**
app.get("/api/topMovies", (req, res) => {
    try {
        if (!fs.existsSync("movies.json")) {
            return res.status(404).json({ error: "❌ لم يتم العثور على بيانات الأفلام!" });
        }

        const data = fs.readFileSync("movies.json");
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: "❌ حدث خطأ أثناء قراءة البيانات!" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/api/topMovies`));

//==========================================================================
//npm install puppeteer-core@10.4.0 chrome-aws-lambda cors
// const express = require("express");
// const puppeteer = require("puppeteer");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.get("/" , (req,res)=>{
//   res.json({data:"hello"})
// })
// app.get("/api/topMovies", async (req, res) => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
    
//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/91.0.4472.124 Safari/537.36"
//     );

//     await page.goto("https://www.imdb.com/chart/top/?ref_=nv_mv_250", { waitUntil: "domcontentloaded" });

//     // ✅ تأكد من تحميل الأفلام
//     await page.waitForSelector(".ipc-metadata-list-summary-item");

//     // ✅ تمرير الصفحة لأسفل لضمان تحميل جميع الأفلام
//     await page.evaluate(() => window.scrollBy(0, window.innerHeight));

//     // ✅ الانتظار بعد التمرير بطريقة بديلة
//     await new Promise(resolve => setTimeout(resolve, 2000));




//     // ✅ استخراج بيانات جميع الأفلام
//     const movies = await page.evaluate(() => {
//       return [...document.querySelectorAll(".ipc-metadata-list-summary-item")].map((movie, index) => {
//         const elements = [...movie.querySelectorAll(".URyjV")]; // جلب جميع العناصر ذات الكلاس .URyjV
//         return {
//         rank: index + 1,
//         title: movie.querySelector(".ipc-title__text")?.innerText || "غير متوفر",
//         rating: movie.querySelector(".ipc-rating-star--imdb")?.innerText || "غير متوفر",
//         year: elements[0]?.innerText.trim() || "غير متوفر", // أول عنصر
//         time: elements[1]?.innerText.trim() || "غير متوفر", // ثاني عنصر
//         age: elements[2]?.innerText.trim() || "غير متوفر", // ثالث
      
//         image: movie.querySelector(".ipc-image")?.src || "",
//         link: "https://www.imdb.com" + movie.querySelector("a.ipc-title-link-wrapper")?.getAttribute("href"),
//     }
//   });
//     });
//   // more: [...movie.querySelectorAll(".URyjV")]
//         // .map(element => element.innerText.trim()) // استخراج النصوص
//         // .join(" | ") || "غير متوفر",
//     await browser.close();
//     res.json({topMovies:movies});
//   } catch (error) {
//     console.error("❌ خطأ:", error.message);
//     res.status(500).json({ error: "فشل في جلب البيانات" });
//   }
// });

// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/api/topMovies`));




