import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { CalculateResData, DateOption, FormFields } from "../../../types";
import { createTheme, Paper, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { teal } from "@mui/material/colors";
import { Form } from "./components/Form";
import { Result } from "./components/Results";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

const theme = createTheme({
  palette: {
    primary: {
      main: teal[500],
    },
    background: {
      default: teal[300],
    },
    secondary: {
      main: "#11cb5f",
    },
  },
});

const baseUrlByEnvironment = {
  prod: "https://api.inflator.co.uk",
  nonprod: "https://api.nonprod-inflator.co.uk",
  local: "http://localhost:3001",
};

const environment = process.env.REACT_APP_ENVIRONMENT;

const baseUrl =
  ((environment === "prod" || environment === "nonprod") &&
    baseUrlByEnvironment[environment]) ||
  baseUrlByEnvironment["local"];

function App() {
  const [calculationResult, setCalculationResult] =
    useState<CalculateResData>();
  const [options, setOptions] = useState<DateOption[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!options) {
      const get = async () => {
        const res = await axios.get<DateOption[]>(
          `${baseUrl}/get-date-options`
        );

        const sortedOptions = res.data
          .sort((a, b) => a.isoDate.localeCompare(b.isoDate))
          .reverse();

        setOptions(sortedOptions);
      };

      get();
    }
  });

  const onSubmit = async ({
    startingYear,
    startingMonth,
    startingSalary,
  }: FormFields) => {
    setIsLoading(true);
    setCalculationResult(undefined);

    try {
      const res = await axios.get<CalculateResData>(
        `${baseUrl}/calculate?startingYear=${startingYear}&startingMonth=${startingMonth}&startingSalary=${startingSalary}`
      );

      if (res.status === 200) {
        setCalculationResult(res.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <main>
        <Container>
          <Paper
            elevation={4}
            sx={{
              mt: {
                xs: 3,
                sm: 5,
              },
              borderRadius: "22px",
            }}
          >
            <Grid
              container
              alignItems="center"
              sx={{
                px: 2,
                py: {
                  xs: 3,
                  lg: 5,
                },
                textAlign: "center",
              }}
            >
              <Grid item xs={12} md={5} sx={{}}>
                <Form
                  isLoading={isLoading}
                  options={options}
                  onSubmit={onSubmit}
                />
              </Grid>
              <Grid
                item
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: {
                    xs: 2,
                    sm: 3,
                    md: "auto",
                  },
                  mb: {
                    md: "auto",
                  },
                }}
                xs={12}
                md={7}
              >
                <Result calculationResult={calculationResult} />
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </main>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
