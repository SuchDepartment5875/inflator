import { AppBar, Button, Modal, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import Logo from "../img.png";
import { DataSourceCopy } from "./DataSourceCopy";

export const Header = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "2px solid #000",
    borderRadius: 10,
    boxShadow: 24,
    width: { xs: 275, sm: 500, md: 750, lg: 750 },
    p: 4,
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          component="img"
          sx={{
            height: {
              xs: 60,
              sm: 100,
            },
          }}
          alt="Your logo."
          src={Logo}
        />
        <Box>
          <Typography variant="h6" component="div">
            Inflator
          </Typography>
        </Box>
        <Box onClick={toggleOpen}>
          <Button color="inherit">About</Button>
        </Box>
      </Toolbar>
      <Modal open={open} onClose={toggleOpen}>
        <Box sx={style}>
          <Typography
            textAlign="center"
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            About
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Recent monthly inflation rates in the UK are the highest they have
            been in modern times, contributing towards a cost of living crisis,
            as costs increase faster than incomes do.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            This calculator is designed to show you how your income has changed
            in real terms since a particular date, and you what income your
            needs to be today to have the value in real terms.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <DataSourceCopy />
          </Typography>
        </Box>
      </Modal>
    </AppBar>
  );
};
