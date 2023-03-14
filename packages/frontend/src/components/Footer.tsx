import { colors, Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { DataSourceCopy } from "./DataSourceCopy";

export const FooterTypography = ({
  children,
}: {
  children: string | JSX.Element;
}) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="caption"
        sx={{
          textAlign: "center",
          fontSize: {
            xs: 10,
            sm: 12,
          },
          borderRadius: "22px",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

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
      <Container
        maxWidth="lg"
        sx={{
          my: {
            xs: 1,
            sm: 2,
          },
        }}
      >
        <FooterTypography>
          No personally identifiable information is stored by this service.
        </FooterTypography>
        <FooterTypography>
          <DataSourceCopy />
        </FooterTypography>
      </Container>
    </Paper>
  );
};
