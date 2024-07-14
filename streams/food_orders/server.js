const express = require("express");
const { Worker } = require("worker_threads");
const { Readable } = require("stream");

const app = express();
const PORT = 5001;

app.get("/order/:id", (req, res) => {
  const orderId = req.params.id;

  // Create a readable stream
  const stream = new Readable({
    read() {},
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  stream.pipe(res);

  // Start worker for parallel computation
  const worker = new Worker("./test_worker.js", {
    workerData: { orderId },
  });

  worker.on("message", (data) => {
    stream.push(`data: ${JSON.stringify(data)}\n\n`);
    console.log(data);
  });

  worker.on("error", (err) => {
    stream.push(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      stream.push(
        `data: ${JSON.stringify({
          error: "Worker stopped with exit code " + code,
        })}\n\n`
      );
    }
    stream.push(null);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
