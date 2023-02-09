import fs from "fs";
import { streamToString } from "./parsers";

describe("streamToString", () => {
  test("returns a string from a readable stream", async () => {
    const readableStream = fs.createReadStream(
      __dirname + "/../test-utils/test-input-data.csv"
    );

    const result = await streamToString(readableStream);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toBe(
      "  Title,CPI ANNUAL RATE 00: ALL ITEMS 2015=100,\r\n  2020 FEB,1.2,\r\n  2020 MAR,5.6,\r\n  2020,7.8,\r\n  2021,invalid,"
    );
  });
});
