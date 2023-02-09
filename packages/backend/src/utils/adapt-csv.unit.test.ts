import { EOL } from "os";

jest.mock("axios");
jest.mock("../clients/s3");

const CSV_STRING = [
  "Title,CPI ANNUAL RATE 00: ALL ITEMS 2015=100",
  "2020 FEB,1.2",
  "2020 MAR,5.6",
  "2020,7.8",
  "2021,invalid",
].join(EOL);

test("Adapts an ONS inflation CSV into the correct shape", async () => {
  require("axios").mockReturnValue({
    data: CSV_STRING,
  });

  const { adaptCsv } = require("./adapt-csv");

  const result = await adaptCsv();

  const sendtMock = require("../clients/s3").s3Client.send;

  expect(result).toStrictEqual([
    {
      cpi: 1.2,
      isoDate: "2020-02-01T00:00:00Z",
      month: "February",
      timePeriod: "2020 FEB",
      year: 2020,
    },
    {
      cpi: 5.6,
      isoDate: "2020-03-01T00:00:00Z",
      month: "March",
      timePeriod: "2020 MAR",
      year: 2020,
    },
  ]);
}, 300000);
