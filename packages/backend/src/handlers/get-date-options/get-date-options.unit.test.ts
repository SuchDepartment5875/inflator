import { mockApiGatewayEvent } from "../../../../../test-utils";

jest.mock("../../utils/get-inflation-periods");

test("Returns proper1", async () => {
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
      month: "March",
      isoDate: "2022-03-01T00:00:00Z",
      cpi: 3.2,
    },
  ];

  require("../../utils/get-inflation-periods").getInflationPeriods.mockReturnValue(
    options
  );

  const { getDateOptions } = require("./get-date-options");

  const res = await getDateOptions(mockApiGatewayEvent);
  expect(res).toStrictEqual([
    {
      cpi: 5.5,
      fullMonth: "January",
      isoDate: "2018-01-01T00:00:00Z",
      month: "January",
      monthNumber: 1,
      timePeriod: "2018 Jan",
      year: 2018,
    },
    {
      cpi: 3.2,
      fullMonth: "March",
      isoDate: "2022-03-01T00:00:00Z",
      month: "March",
      monthNumber: 3,
      timePeriod: "2022 Mar",
      year: 2022,
    },
  ]);
});
