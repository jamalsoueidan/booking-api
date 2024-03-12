/*
 * to remove '.d.ts' in the import statements for the admin.generated.d.ts file
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "./src/types/admin.generated.d.ts");

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    return console.log(err);
  }

  // Replace import paths
  const result = data.replace(/\.d\.ts/g, "");

  fs.writeFile(filePath, result, "utf8", (err) => {
    if (err) return console.log(err);
    console.log("The import paths have been updated.");
  });
});
