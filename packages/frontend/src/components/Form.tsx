import {
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { DateOptions, FormFields } from "../../../../types";
import { groupBy } from "lodash";
import { styled } from "@mui/system";

const StyledForm = styled("form")({ marginTop: "auto", marginBottom: "auto" });

const defaultValues: FormFields = {
  startingYear: "2021",
  startingMonth: "January",
  startingSalary: "",
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type IProps = {
  options: DateOptions | undefined;
  isLoading: boolean;
  onSubmit: (formFields: FormFields) => Promise<void>;
};

export const Form = ({ options, isLoading, onSubmit }: IProps) => {
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: defaultValues,
  });

  const optionsGroupedByMonthNumber = groupBy(options, (i) => i.month);

  const watchStartingMonth = watch("startingMonth");

  const optionYears = optionsGroupedByMonthNumber[watchStartingMonth] || [
    { year: "2021" },
  ];

  return (
    <StyledForm>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ mx: "auto", width: 215, borderRadius: "50%" }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="stretch"
          spacing={2}
          direction="column"
        >
          <Grid item>
            <Typography variant="body2">My income has been</Typography>
            <Controller
              name={"startingSalary"}
              control={control}
              rules={{
                pattern: /\d+/,
                required: true,
                min: {
                  value: 1,
                  message: "Must be greater than 0",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  sx={{ mt: 1 }}
                  onChange={onChange}
                  value={value}
                  required
                  error={Boolean(errors.startingSalary)}
                  helperText={errors.startingSalary?.message}
                  type="number"
                  inputProps={{
                    "data-testid": "inputStartSalary",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">£</InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2">Since</Typography>
            <Box
              sx={{
                display: "flex",
                mt: 1,
                justifyContent: "space-between",
              }}
            >
              <Controller
                name={"startingMonth"}
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value}
                    name="inputMonth"
                    data-testid="inputMonth"
                    select
                    onChange={onChange}
                    sx={{
                      flexGrow: 1,
                    }}
                    label="Month"
                  >
                    {months.map((i) => (
                      <MenuItem
                        data-testid={`month-option-${i}`}
                        key={i}
                        value={i}
                      >
                        {i}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name={"startingYear"}
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value}
                    name="inputYear"
                    data-testid="inputYear"
                    onChange={onChange}
                    label="Year"
                    color="secondary"
                    select
                  >
                    {optionYears.map((i) => (
                      <MenuItem key={i.year} value={i.year}>
                        {i.year}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Grid>

          <Grid item>
            {isLoading || false ? (
              <CircularProgress size={"38.5px"} />
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                sx={{ height: "45.5px" }}
                data-testid="submit-btn"
              >
                Calculate
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    </StyledForm>
  );
};
