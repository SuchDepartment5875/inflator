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

const formatAmountPercentage = (
  realTermsPercentagePayChange: number,
  realTermsAbsoluteChange: number
) => {
  if (realTermsPercentagePayChange === 0 || realTermsAbsoluteChange === 0) {
    return "0";
  }

  return `${Math.abs((realTermsPercentagePayChange - 1) * 100).toFixed(1)}`;
};

function formatAmount2(amount: string | number) {
  return Number(amount).toLocaleString("en-GB", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const formatInflationPercentage = (inflation: number) =>
  (((inflation || 1) - 1) * 100).toFixed(1);

const formatRequiredSalary = (inflatedSalary: number) =>
  inflatedSalary.toFixed(2);

const formatSince = (month: string, year: number) => `${month} ${year}`;

const defaultValues = {
  direction: absoluteChangeToDescripton(-1),
  inflationRatePercentage: formatInflationPercentage(-1),
  requiredSalary: formatRequiredSalary(10000),
  since: formatSince("January", 2021),
  amountPercentage: formatAmountPercentage(-1, -1),
  amountAbsolute: formatAmount2(-1),
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
        amountPercentage: formatAmountPercentage(
          calculationResult.realTermsPercentagePayChange,
          calculationResult.realTermsAbsoluteChange
        ),
        amountAbsolute: formatAmount2(
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

  const UnblurredBold = styled("b")(calculationResult ? {} : {});

  return (
    <Paper
      elevation={10}
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
        m: 2,
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
          <Typography>Due to an inflation rate of</Typography>
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
              {formattedResults.direction} {formattedResults.amountPercentage}
            </BlurredBold>
            <UnblurredBold sx={{ color: formattedResults.colour }}>
              % / £
            </UnblurredBold>
            <BlurredBold sx={{ color: formattedResults.colour }}>
              {formattedResults.amountAbsolute}
            </BlurredBold>
          </Typography>
        </Grid>

        <Grid data-testid="matched-income" item>
          <Typography>To keep up with inflation</Typography>
          <Typography>your income needs to be</Typography>
          <Typography>
            <b>£</b>
            <BlurredBold>
              {formatAmount2(formattedResults.requiredSalary)}
            </BlurredBold>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
