import { colors, Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { DataSourceCopy } from "./DataSourceCopy";

export const Footer = () => {
  return (
    <Paper
      sx={{
        py: 1,
        width: "100%",
        position: "fixed",
        bottom: 0,
        backgroundColor: colors.teal[50],
      }}
      component="footer"
      square
    >
      <Container maxWidth="lg" sx={{ my: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption">
            No personally identifiable information is stored by this service.
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <DataSourceCopy variant="caption" />
        </Box>{" "}
      </Container>
    </Paper>
  );
};
