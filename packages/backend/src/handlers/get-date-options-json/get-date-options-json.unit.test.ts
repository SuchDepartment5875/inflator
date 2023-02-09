import { mockApiGatewayEvent } from "../../../../../test-utils";

jest.mock("./adapted-mm23.json", () => [
  {
    timePeriod: "1989 JAN",
    year: 1989,
    month: "January",
    isoDate: "1989-01-01T00:00:00Z",
    cpi: 4.9,
  },
  {
    timePeriod: "1989 FEB",
    year: 1989,
    month: "February",
    isoDate: "1989-02-01T00:00:00Z",
    cpi: 5,
  },
]);

test("Returns proper3", async () => {
  const options = [
    {
      timePeriod: "2018 Jan",
      year: 2018,
      month: "January",
      isoDate: "2018-01-01T00:00:00Z",
      cpi: 5.5,
    },
    {
      timePeriod: "2022 Mar",
      year: 2022,
      month: "February",
      isoDate: "2022-03-01T00:00:00Z",
      cpi: 3.2,
    },
  ];

  const { getDateOptionsJson } = require("./get-date-options-json");

  const res = await getDateOptionsJson(mockApiGatewayEvent);
  expect(res).toStrictEqual([
    {
      cpi: 4.9,
      isoDate: "1989-01-01T00:00:00Z",
      month: "January",
      timePeriod: "1989 JAN",
      monthNumber: 2, // to do fix this
      year: 1989,
    },
    {
      cpi: 5,
      isoDate: "1989-02-01T00:00:00Z",
      month: "February",
      timePeriod: "1989 FEB",
      monthNumber: 2,
      year: 1989,
    },
  ]);
});
