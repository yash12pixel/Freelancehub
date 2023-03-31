import React from "react";
import { Alert, AlertTitle, Snackbar, Stack } from "@mui/material";
const ErrorMessageAlert = (props) => {
  const { vertical, horizontal, open, msg } = props.snackbar;
  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      onClose={props.handleClose}
      snackbar={props.snackbar}>
      <Alert sx={{ width: "100%" }} severity="warning">
        <AlertTitle>{msg}</AlertTitle>
      </Alert>
    </Snackbar>
  );
};

export default ErrorMessageAlert;
