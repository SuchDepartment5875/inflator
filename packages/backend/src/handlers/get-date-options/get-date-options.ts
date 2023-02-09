import { DateOption, Month, MonthNumber } from "../../../../../types";
import { getInflationPeriods } from "../../utils/get-inflation-periods";

const mmmToMonth = (month: string): MonthNumber => {
  switch (month) {
    case "January":
      return 1;
    case "February":
      return 2;
    case "March":
      return 3;
    case "April":
      return 4;
    case "May":
      return 5;
    case "June":
      return 6;
    case "July":
      return 7;
    case "August":
      return 8;
    case "September":
      return 9;
    case "October":
      return 10;
    case "November":
      return 11;
    case "December":
      return 12;
    default:
      throw new Error("Unsupported month");
  }
};

export async function getDateOptions(): Promise<DateOption[]> {
  const inflationPeriods = await getInflationPeriods();
  const dates = inflationPeriods.map((i) => ({
    timePeriod: i.timePeriod,
    isoDate: i.isoDate,
    year: i.year,
    month: i.month,
    fullMonth: i.month,
    monthNumber: mmmToMonth(i.month),
    cpi: i.cpi,
  }));

  return dates;
}
