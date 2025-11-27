import fs from "fs";
import path from "path";
const DATA_FILE = path.resolve("data.json");

const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

export { readData, writeData };
