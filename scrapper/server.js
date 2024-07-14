const express = require("express");
const worker = require("node:worker_threads");
const app = express();
const PORT = 3001;

const competitorUrls = [
  {
    company: "Flipkart",
    url: "https://www.flipkart.com/search?q=iphone%2014&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off",
  },
  {
    company: "Jio",
    url: "https://www.jiomart.com/search/iphone%2015%20plus/in/prod_mart_master_vertical",
  },
];

app.get("/compare-prices", (req, res) => {
  const results = [];
  let completed = 0;

  competitorUrls.forEach((url) => {
    const worker = new Worker("./worker.js", {
      workerData: { url },
    });

    worker.on("message", (message) => {
      results.push(message);
      completed += 1;
      if (completed === competitorUrls.length) {
        res.json(results);
      }
    });

    worker.on("error", (error) => {
      results.push({ company: url.company, error: error.message });
      completed += 1;
      if (completed === competitorUrls.length) {
        res.json(results);
      }
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  });
});

app.get("/simple-request", (req, res) => {
  res.send("This is a simple request response.");
});

app.get("/block-main-thread", (req, res) => {
  // CPU-intensive task to block the main thread
  const start = Date.now();
  while (Date.now() - start < 10000) {
    // Busy-wait loop to block the main thread for 10 seconds
  }
  res.send("Main thread was blocked for 10 seconds.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
