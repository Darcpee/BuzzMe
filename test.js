const fs = require("fs");
const path = require("path");

const folder = path.join(process.cwd(), "uploads", "profile");
const file = path.join(folder, "test.txt");

console.log("Folder:", folder);
console.log("Exists:", fs.existsSync(folder));

fs.writeFile(file, "Hello World", (err) => {
    if (err) {
        console.error("WRITE ERROR:", err);
    } else {
        console.log("File created successfully.");
    }
});