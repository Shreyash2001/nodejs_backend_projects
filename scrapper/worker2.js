const { parentPort, workerData } = require("worker_threads");
const scrapeWebsite = require("./scrapper");

async function main() {
  const url = workerData.url;
  try {
    const prices = await scrapeWebsite(url);
    if (prices) {
      parentPort.postMessage({ company: url.company, prices });
    } else {
      parentPort.postMessage({ company: url.company, error: "Failed to scrape prices" });
    }
  } catch (error) {
    parentPort.postMessage({ company: url.company, error: error.message });
  }
}

main();
