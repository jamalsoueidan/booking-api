import {
  SettingServiceFindOneAndUpdate,
  SettingServiceGet,
} from "./setting.service";

require("~/library/jest/mongoose/mongodb.jest");

describe("SettingService", () => {
  it("Should create or update a setting", async () => {
    const body = {
      language: "en",
    };

    const createSetting = await SettingServiceFindOneAndUpdate(body);
    expect(createSetting.language).toEqual(body.language);
  });

  it("Should find setting", async () => {
    await SettingServiceFindOneAndUpdate({
      language: "en",
    });

    const findSetting = await SettingServiceGet();
    expect(findSetting?.language).toEqual("en");
  });
});
