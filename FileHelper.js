const fs = require('fs');
const readline = require('readline');
async function readFile(filePath) {
  const lines = [];
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lines.push(line);
  }

  return lines;
}

async function appendFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


module.exports = {
  readFile,
  appendFile
}