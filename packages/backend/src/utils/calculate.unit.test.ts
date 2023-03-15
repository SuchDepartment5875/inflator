import { calculateInflationSince, calculatePayStats } from "./calculate";

jest.mock("../utils/get-inflation-periods", () => ({
  getInflationPeriods: () => [
    {
      timePeriod: "1989 JAN",
      year: 1989,
      month: "January",
      isoDate: "1989-01-01T00:00:00Z",
      cpi: 14.9,
    },
    {
      timePeriod: "1989 FEB",
      year: 1989,
      month: "February",
      isoDate: "1989-02-01T00:00:00Z",
      cpi: 5,
    },
    {
      timePeriod: "1989 MAR",
      year: 1989,
      month: "March",
      isoDate: "1989-03-01T00:00:00Z",
      cpi: 5,
    },
  ],
}));

test("calculateInflationSince", async () => {
  const result = await calculateInflationSince({
    startingMonth: "January",
    startingYear: 1989,
    startingSalary: 1,
    finishingMonth: "March",
    finishingYear: 1989,
  });

  expect(result).toStrictEqual(1.020871048900463);
});

test("calculateInflationSince defaults to latest end date", async () => {
  const result = await calculateInflationSince({
    startingMonth: "January",
    startingYear: 1989,
    startingSalary: 1,
  });

  expect(result).toStrictEqual(1.0166350694444446);
});

test("calculatePayStats", async () => {
  const startingSalary = 1000;

  const result = await calculatePayStats({
    startingMonth: "January",
    startingYear: 1989,
    startingSalary,
  });

  expect(result).toStrictEqual({
    currentDate: null,
    inflatedSalary: 1016.6350694444446,
    inflation: 1.0166350694444446,
    realTermsAbsoluteChange: -16.63506944444464,
    realTermsPercentageDifferent: -0.01636287193351993,
    realTermsPercentagePayChange: 0.9836371280664801,
    startingSalary: 1000,
    startingTimePeriod: {
      cpi: 14.9,
      isoDate: "1989-01-01T00:00:00Z",
      month: "January",
      monthNumber: 2,
      timePeriod: "1989 JAN",
      year: 1989,
    },
  });
});

test("calculatePayStats throws if starting date is not found", async () => {
  const startingSalary = 1000;

  await expect(
    calculatePayStats({
      startingMonth: "January",
      startingYear: 2055,
      startingSalary,
    })
  ).rejects.toThrow("No matching time period found");
});
