import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button, Typography, TextField } from "@mui/material";
import Request from "../../utils/request";
import { useNavigate } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f1f1f1",
  },
  title: {
    fontWeight: "bold",
    color: "#555",
  },
  input: {},
  button: {
    backgroundColor: "#555",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
}));

function ConfirmEmail() {
  const classes = useStyles();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState({
    showSuccessModal: false,
    ShowWarningModal: false,
    msg: "",
  });

  let onSuccessCloseErrorModal = () => {
    setShow({
      ...show,
      ShowWarningModal: false,
      showSuccessModal: false,
      msg: "",
    });
    navigate("/");
  };

  let onCloseErrorModal = () => {
    setShow({
      ...show,
      ShowWarningModal: false,
      showSuccessModal: false,
      msg: "",
    });
  };

  const handleConfirmClick = async () => {
    // Perform email confirmation logic here
    const verificationToken = localStorage.getItem("verificationToken");
    setOpen(true);
    try {
      const response = await Request.post("/auth/verifyEmail", {
        verificationToken: verificationToken,
      })
        .then((res) => {
          setOpen(false);
          console.log(res);
          // document.getElementById("signupform").reset();
          setShow({
            ...show,
            showSuccessModal: true,
            msg: "Verified Successfully!",
          });
          localStorage.removeItem("verificationToken", verificationToken);
        })
        .catch((error) => {
          setOpen(false);
          setShow({
            ...show,
            ShowWarningModal: true,
            msg: error.response.data.message,
          });
          console.log(error.response.data.message);
        });
      console.log(response);
    } catch (error) {
      setOpen(false);
      console.log(error);
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Click OnConfirm Email to Confirm Your Email
      </Typography>
      <Button
        variant="contained"
        onClick={handleConfirmClick}
        className={classes.button}>
        Confirm Email
      </Button>

      <SuccessModal
        showModal={show.showSuccessModal}
        btnText="Ok"
        msg={show.msg}
        onCloseModal={() => {
          onSuccessCloseErrorModal();
        }}></SuccessModal>

      <WarningModal
        showModal={show.ShowWarningModal}
        msg={show.msg}
        onCloseModal={() => {
          onCloseErrorModal();
        }}></WarningModal>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default ConfirmEmail;
