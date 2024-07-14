const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const { Transform, Readable } = require("stream");

const app = express();
const port = 5000;

const upload = multer();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
app.post("/upload", upload.single("file"), async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);
  const csvStream = readableStream.pipe(csv());

  let firstRow = true;
  let buffer = [];

  const transformStream = new Transform({
    objectMode: true,
    async transform(chunk, encoding, callback) {
      if (firstRow) {
        for (const key in chunk) {
          const upperKey = key.toUpperCase();
          chunk[upperKey] = chunk[key];
          delete chunk[key];
        }
        firstRow = false;
      }

      buffer.push(chunk);

      if (buffer.length === 100) {
        this.push(JSON.stringify(buffer) + "\n");
        buffer = [];
      }

      callback();
    },
    flush(callback) {
      if (buffer.length > 0) {
        this.push(JSON.stringify(buffer) + "\n");
      }
      callback();
    },
  });

  csvStream.pipe(transformStream).pipe(res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
