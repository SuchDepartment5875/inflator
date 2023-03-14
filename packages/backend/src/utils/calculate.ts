import { StringMap } from "aws-lambda/trigger/cognito-user-pool-trigger/_common";
import { differenceInMonths, formatISO, parse } from "date-fns";
import {
  CalculateParams,
  CalculateResData,
  DateOption,
} from "../../../../types";
import { getInflationPeriods } from "./get-inflation-periods";

export async function calculateInflationSince({
  startingMonth,
  startingYear,
  finishingMonth,
  finishingYear,
}: CalculateParams) {
  const inflationPeriods = await getInflationPeriods();

  const startIndex = inflationPeriods.findIndex(
    (row) => row.month === startingMonth && row.year === startingYear
  );
  const endIndex =
    finishingMonth && finishingYear
      ? inflationPeriods.findIndex(
          (row) => row.month === finishingMonth && row.year === finishingYear
        ) + 1
      : inflationPeriods.length - 1;

  const selectedInflationPeriods = inflationPeriods
    .slice(startIndex, endIndex)
    .map((row) => {
      const parsedDate = parse(row.timePeriod, "y MMM", new Date());
      return {
        ...row,
        date: parsedDate,
        dateISO: formatISO(parsedDate),
      };
    });

  const durations = [];

  for (let i = 0; i < selectedInflationPeriods.length; i++) {
    if (i === selectedInflationPeriods.length - 1) {
      durations.push({
        start: selectedInflationPeriods[i].dateISO,
        duration: 1,
        cpi: selectedInflationPeriods[i].cpi,
      });
    } else {
      const nextDate = new Date(selectedInflationPeriods[i + 1].dateISO);
      const prevDate = new Date(selectedInflationPeriods[i].dateISO);
      const diff = differenceInMonths(nextDate, prevDate);

      durations.push({
        start: selectedInflationPeriods[i].dateISO,
        duration: diff,
        cpi: selectedInflationPeriods[i].cpi,
      });
    }
  }

  const res = durations.reduce((accumulator, nextValue) => {
    return accumulator * (1 + (nextValue.duration * nextValue.cpi) / 12 / 100);
  }, 1);

  return res;
}

export async function calculatePayStats({
  startingMonth,
  startingSalary,
  startingYear,
}: CalculateParams): Promise<CalculateResData> {
  const inflationPeriods = await getInflationPeriods();

  const inflation = await calculateInflationSince({
    startingMonth,
    startingSalary,
    startingYear,
  }); // in percent (i.e. 1 for 1%)

  const inflatedSalary = startingSalary * inflation;

  const realTermsAbsoluteChange = startingSalary - inflatedSalary;

  const realTermsPercentagePayChange = startingSalary / inflatedSalary;

  const realTermsPercentageDifferent = realTermsPercentagePayChange - 1; // your pay is worth this many percent more or less (if -)

  const startingTimePeriod = inflationPeriods.find(
    (row) => row.month === startingMonth && row.year === startingYear
  );

  if (!startingTimePeriod) {
    throw new Error("No matching time period found");
  }

  const startingTimePeriodConverted: DateOption = {
    ...startingTimePeriod,
    monthNumber: 2,
  };

  const res = {
    inflation,
    inflatedSalary,
    startingSalary,
    startingTimePeriod: startingTimePeriodConverted,
    currentDate: null,
    realTermsAbsoluteChange,
    realTermsPercentagePayChange,
    realTermsPercentageDifferent,
  };

  return res;
}
