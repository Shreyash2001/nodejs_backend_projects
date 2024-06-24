const puppeteer = require("puppeteer");

async function scrapeWebsite(urlObj) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, slowMo: 50 }); // Changed headless to true for background scraping
    const page = await browser.newPage();
    await page.goto(urlObj.url, { waitUntil: "networkidle2" }); // Ensures the page is fully loaded

    let prices;
    if (urlObj.company === "Flipkart") {
      prices = await page.evaluate(() => {
        const priceElements = document.querySelectorAll(".Nx9bqj._4b5DiR");
        return Array.from(priceElements).map((el) => el.innerText);
      });
    } else if (urlObj.company === "Jio") {
      prices = await page.evaluate(() => {
        const priceElements = document.querySelectorAll(".jm-heading-xxs");
        return Array.from(priceElements).map((el) => el.innerText);
      });
    }

    return prices;
  } catch (error) {
    console.error("Error in scrapeWebsite:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = scrapeWebsite;
