import { calculateLambda } from "./calculate";
import { mockApiGatewayEvent } from "../../../../../test-utils";
jest.mock("../../utils/calculate");

test("throws if no query parameters are provided", async () => {
  await expect(calculateLambda(mockApiGatewayEvent)).rejects.toThrow(
    "No query parameters provided"
  );
});

test("throws if query parameter `startingSalary` is missing", async () => {
  const event = {
    ...mockApiGatewayEvent,
    queryStringParameters: {
      currentSalary: "2",
      startingMonth: "January",
      startingYear: "1999",
    },
  };
  await expect(calculateLambda(event)).rejects.toThrow(
    "Missing required parameter"
  );
});

test("throws if query parameter `currentSalary` is missing", async () => {
  const event = {
    ...mockApiGatewayEvent,
    queryStringParameters: {
      startingSalary: "2",
      startingMonth: "January",
      startingYear: "1999",
    },
  };
  await expect(calculateLambda(event)).rejects.toThrow(
    "Missing required parameter"
  );
});

test("throws if query parameter `startingYear` is missing", async () => {
  const event = {
    ...mockApiGatewayEvent,
    queryStringParameters: {
      startingSalary: "2",
      currentSalary: "2",
      startingMonth: "January",
    },
  };
  await expect(calculateLambda(event)).rejects.toThrow(
    "Missing required parameter"
  );
});

test("throws if query parameter `startingMonth` is missing", async () => {
  const event = {
    ...mockApiGatewayEvent,
    queryStringParameters: {
      startingSalary: "2",
      currentSalary: "2",
      startingYear: "1999",
    },
  };
  await expect(calculateLambda(event)).rejects.toThrow(
    "Missing required parameter"
  );
});

test("Returns proper", async () => {
  const event = {
    ...mockApiGatewayEvent,
    queryStringParameters: {
      startingSalary: "2",
      currentSalary: "3",
      startingMonth: "January",
      startingYear: "2019",
    },
  };

  const mockReturnValue = { a: 1, c: 23 };
  require("../../utils/calculate").calculatePayStats.mockReturnValue(
    mockReturnValue
  );

  const res = await calculateLambda(event);
  expect(res).toBe(mockReturnValue);
});
