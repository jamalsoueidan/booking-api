const fs = require("fs");

// Read the contents of the local.settings.json file
const localSettings = JSON.parse(
  fs.readFileSync("./local.settings.json", "utf-8")
);

// Set environment variables from the "Values" object in local.settings.json
for (const key in localSettings.Values) {
  process.env[key] = localSettings.Values[key];
}
