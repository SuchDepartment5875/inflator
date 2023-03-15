import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import App from "./App";

jest.mock("axios");

process.env.REACT_APP_ENVIRONMENT = "prod";

const mockOptions = [
  {
    timePeriod: "timePeriod",
    isoDate: "",
    year: 2020,
    month: "January",
    monthNumber: 2,
    cpi: 4,
  },
  {
    timePeriod: "timePeriod",
    isoDate: "",
    year: 2020,
    month: "February",
    monthNumber: 2,
    cpi: 4,
  },
  {
    timePeriod: "timePeriod",
    isoDate: "",
    year: 2021,
    month: "January",
    monthNumber: 2,
    cpi: 4,
  },
  {
    timePeriod: "timePeriod",
    isoDate: "",
    year: 2021,
    month: "February",
    monthNumber: 2,
    cpi: 4,
  },
];

const mockCalculation = {
  inflation: 123,
  inflatedSalary: 1234,
  startingSalary: 12345,
  currentSalary: 123456,
  startingTimePeriod: {
    timePeriod: "timePeriod",
    isoDate: "",
    year: 2021,
    month: "March",
    monthNumber: 2,
    cpi: 4,
  },
  realTermsAbsoluteChange: 456,
  realTermsPercentagePayChange: 789,
  realTermsPercentageDifferent: 342,
};

test("when the form is submitted, the results are shown", async () => {
  require("axios").get.mockImplementation((x: any) => {
    const urlPath = x.substr(26).split("?")[0];

    switch (urlPath) {
      case "/get-date-options":
        return {
          status: 200, // make sure this fails gracefully?
          data: mockOptions,
        };
      case "/calculate":
        return {
          status: 200,
          data: mockCalculation,
        };
    }
  });

  const mockStartSalary = "42";

  render(<App />);

  const selectMonth = screen.getByTestId("inputMonth");

  // wait for initial date options to be retrieved

  const getMock = require("axios").get;

  await waitFor(() =>
    expect(getMock).toHaveBeenNthCalledWith(
      1,
      "https://api.inflator.co.uk/get-date-options"
    )
  );

  /* Complete the form */
  // change month

  const buttonMonth = within(selectMonth).getByRole("button");
  fireEvent.mouseDown(buttonMonth);

  const listboxMonth = within(screen.getByRole("presentation")).getByRole(
    "listbox"
  );

  const optionsMonth = within(listboxMonth).getAllByRole("option");
  fireEvent.click(optionsMonth[1]);
  fireEvent.keyDown(listboxMonth, {
    key: "Escape",
    code: "Escape",
  });

  // change year
  const selectYear = screen.getByTestId("inputYear");

  const buttonYear = within(selectYear).getByRole("button");
  fireEvent.mouseDown(buttonYear);

  const listboxYear = within(screen.getByRole("presentation")).getByRole(
    "listbox"
  );

  const optionsYear = within(listboxYear).getAllByRole("option");

  fireEvent.click(optionsYear[1]);
  fireEvent.keyDown(listboxYear, {
    key: "Escape",
    code: "Escape",
  });

  const inputStartSalary = screen.getByTestId("inputStartSalary");
  fireEvent.change(inputStartSalary, { target: { value: mockStartSalary } });

  /* Submit the form */

  const submitBtn = screen.getByTestId("submit-btn");
  const resultContainer = screen.getByTestId("result");

  fireEvent.click(submitBtn);

  /* Check the results are shown as expected */

  await waitFor(() =>
    within(resultContainer).findByTestId("result-populated-true")
  );

  expect(require("axios").get).toHaveBeenNthCalledWith(
    2,
    `https://api.inflator.co.uk/calculate?startingYear=2020&startingMonth=February&startingSalary=${mockStartSalary}`
  );

  expect(
    within(resultContainer).getByTestId("inflation-rate")
  ).toHaveTextContent("Due to an inflation rate of12200.0% since March 2021");
  expect(within(resultContainer).getByTestId("real-income")).toHaveTextContent(
    "Your real terms income hasincreased by 78800.0% / £456"
  );
  expect(
    within(resultContainer).getByTestId("matched-income")
  ).toHaveTextContent("To keep up with inflationyour income needs to be£1,234");
});

// type values into boxes
