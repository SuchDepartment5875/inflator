import { formatISO } from "date-fns";
import parse from "date-fns/parse";
import axios from "axios";
import {
  AdaptedONSRow,
  Month,
  ONSRow,
  onsRow,
  TitleSchema,
} from "../../../../types";
const csv = require("fast-csv");

const csvMonthToMonth = (titleString: TitleSchema): Month => {
  const title = titleString.substring(5);
  switch (title) {
    case "JAN":
      return "January";
    case "FEB":
      return "February";
    case "MAR":
      return "March";
    case "APR":
      return "April";
    case "MAY":
      return "May";
    case "JUN":
      return "June";
    case "JUL":
      return "July";
    case "AUG":
      return "August";
    case "SEP":
      return "September";
    case "OCT":
      return "October";
    case "NOV":
      return "November";
    case "DEC":
      return "December";
    default:
      throw new Error(`Unsupported title: ${title}`);
  }
};

export async function adaptCsv(): Promise<AdaptedONSRow[]> {
  const response = await axios({
    url: "https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/consumerpriceindices/current/mm23.csv",
    method: "GET",
    responseType: "blob",
  });

  const rawCsvData = response.data;

  return new Promise((resolve, reject) => {
    const adaptedRows: AdaptedONSRow[] = [];
    csv
      .parseString(rawCsvData, { headers: true })
      .on("error", reject)
      .on("data", (row: ONSRow) => {
        try {
          const parsedRow = onsRow.parse(row);

          adaptedRows.push({
            timePeriod: parsedRow.Title,
            year: Number(parsedRow.Title.substring(0, 4)),
            month: csvMonthToMonth(parsedRow.Title),
            isoDate: formatISO(parse(parsedRow.Title, "y MMM", new Date())),
            cpi: Number(parsedRow["CPI ANNUAL RATE 00: ALL ITEMS 2015=100"]),
          });
        } catch (err) {}
      })
      .on("end", () => {
        resolve(adaptedRows);
      });
  });
}
