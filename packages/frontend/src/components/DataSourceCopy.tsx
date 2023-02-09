import { Link, Typography, SxProps } from "@mui/material";

type IProps = {
  sx?: SxProps;
  variant?: "caption";
};

export const DataSourceCopy = ({ sx, variant }: IProps) => (
  <Typography sx={sx} variant={variant}>
    Inflation impact is calculated from CPI data provided by the{" "}
    <Link href="https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindices">
      ONS
    </Link>
    .
  </Typography>
);
