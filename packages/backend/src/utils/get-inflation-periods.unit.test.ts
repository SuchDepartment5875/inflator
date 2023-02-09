import { getInflationPeriods } from "./get-inflation-periods";

jest.mock("../clients/s3", () => ({
  s3Client: {
    send: () => ({
      Body: "aaa",
    }),
  },
}));

jest.mock("./parsers", () => ({
  streamToString: () =>
    '[{"timePeriod":"1989 JAN","year":1989,"month":"January","isoDate":"1989-01-01T00:00:00Z","cpi":4.9}]',
}));

test("calculateInflationSince", async () => {
  const result = await getInflationPeriods();

  expect(result).toStrictEqual([
    {
      cpi: 4.9,
      isoDate: "1989-01-01T00:00:00Z",
      month: "January",
      timePeriod: "1989 JAN",
      year: 1989,
    },
  ]);
});
