import { APIGatewayEvent } from "aws-lambda";
import {
  DateOption,
  DateOptions,
  indexedRecordsSchema,
} from "../../../../../types";
import inflationPeriods from "./adapted-mm23.json";

export async function getDateOptionsJson(): Promise<DateOption[]> {
  const parsed = indexedRecordsSchema.parse(inflationPeriods);

  const dates: DateOptions = parsed.map((i) => ({
    timePeriod: i.timePeriod,
    isoDate: i.isoDate,
    year: i.year,
    month: i.month,
    monthNumber: 2, // to do fix this
    cpi: i.cpi,
  }));

  return dates;
}
