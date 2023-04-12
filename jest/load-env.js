const fs = require("fs");

if (fs.existsSync("./local.settings.json")) {
  const localSettings = JSON.parse(
    fs.readFileSync("./local.settings.json", "utf-8")
  );

  for (const key in localSettings.Values) {
    process.env[key] = localSettings.Values[key];
  }
}
