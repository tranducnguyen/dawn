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


module.exports = {
  readFile
}