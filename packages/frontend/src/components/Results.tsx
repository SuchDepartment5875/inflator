import React from "react";
import Typography from "@mui/material/Typography";
import { Paper, Grid } from "@mui/material";
import { CalculateResData } from "../../../../types";
import { styled } from "@mui/system";

const absoluteChangeToDescripton = (realTermsAbsoluteChange: number) => {
  if (realTermsAbsoluteChange === 0) {
    return "not changed";
  }

  if (realTermsAbsoluteChange > 0) {
    return "increased by";
  }

  return "decreased by";
};

const absoluteChangeToColour = (realTermsAbsoluteChange: number) => {
  if (realTermsAbsoluteChange === 0) {
    return "black";
  }

  if (realTermsAbsoluteChange > 0) {
    return "green";
  }

  return "red";
};

const formatAmount = (
  realTermsPercentagePayChange: number,
  realTermsAbsoluteChange: number
) => {
  if (realTermsPercentagePayChange === 0 || realTermsAbsoluteChange === 0) {
    return "";
  }

  return `${Math.abs((realTermsPercentagePayChange - 1) * 100).toFixed(
    1
  )}% / £${Math.abs(realTermsAbsoluteChange).toFixed(2)}`;
};

const formatInflationPercentage = (inflation: number) =>
  (((inflation || 1) - 1) * 100).toFixed(1);

const formatRequiredSalary = (inflatedSalary: number) =>
  inflatedSalary.toFixed(2);

const formatSince = (month: string, year: number) => `${month} ${year}`;

const defaultValues = {
  direction: absoluteChangeToDescripton(-1),
  inflationRatePercentage: formatInflationPercentage(-1),
  requiredSalary: formatRequiredSalary(1000),
  since: formatSince("January", 2021),
  amount: formatAmount(-1, -1),
  colour: absoluteChangeToColour(-1),
};

type IProps = {
  calculationResult: CalculateResData | undefined;
};

export const Result = ({ calculationResult }: IProps) => {
  const formattedResults = calculationResult
    ? {
        inflationRatePercentage: formatInflationPercentage(
          calculationResult.inflation
        ),
        requiredSalary: formatRequiredSalary(calculationResult.inflatedSalary),
        since: formatSince(
          calculationResult.startingTimePeriod.month,
          calculationResult.startingTimePeriod.year
        ),
        amount: formatAmount(
          calculationResult.realTermsPercentagePayChange,
          calculationResult.realTermsAbsoluteChange
        ),
        direction: absoluteChangeToDescripton(
          calculationResult.realTermsAbsoluteChange
        ),
        colour: absoluteChangeToColour(
          calculationResult.realTermsAbsoluteChange
        ),
      }
    : defaultValues;

  const BlurredBold = styled("b")(
    calculationResult ? {} : { filter: "blur(4px)" }
  );

  return (
    <Paper
      elevation={10}
      sx={{
        p: {
          xs: 0,
          sm: 3,
        },
        borderRadius: "22px",
        width: "100%",
      }}
      data-testid="result"
    >
      <Grid
        container
        spacing={2}
        justifyContent="center"
        direction="column"
        sx={{
          textAlign: "center",
          py: 1,
          px: {
            xs: 0,
            sm: 6,
          },
        }}
        data-testid={`result-populated-${!!calculationResult}`}
      >
        <Grid data-testid="inflation-rate" item>
          <Typography>Due to an average inflation rate of</Typography>
          <Typography>
            <BlurredBold>
              {formattedResults.inflationRatePercentage}
            </BlurredBold>
            <b>%</b> since <BlurredBold>{formattedResults.since}</BlurredBold>
          </Typography>
        </Grid>

        <Grid data-testid="real-income" item>
          <Typography>Your real terms income has</Typography>
          <Typography>
            <BlurredBold sx={{ color: formattedResults.colour }}>
              {formattedResults.direction} {formattedResults.amount}
            </BlurredBold>
          </Typography>
        </Grid>

        <Grid data-testid="matched-income" item>
          <Typography>Your inflation matched income is</Typography>
          <Typography>
            <b>£</b>
            <BlurredBold>{formattedResults.requiredSalary}</BlurredBold>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
