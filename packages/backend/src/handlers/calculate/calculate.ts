import { APIGatewayEvent } from "aws-lambda";
import { calculatePayStats } from "../../utils/calculate";
import { calculateParams, CalculateResData } from "../../../../../types";

export async function calculateLambda(
  event: APIGatewayEvent
): Promise<CalculateResData> {
  if (!event.queryStringParameters) {
    throw new Error("No query parameters provided");
  }

  const { startingSalary, startingYear, startingMonth } =
    event.queryStringParameters;

  try {
    const parsedParams = calculateParams.parse({
      startingSalary: Number(startingSalary),
      startingYear: Number(startingYear),
      startingMonth: startingMonth,
    });

    return await calculatePayStats(parsedParams);
  } catch (err) {
    console.log(err);
    throw new Error("Missing required parameter");
  }
}
