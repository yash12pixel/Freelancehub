import React, { useState } from "react";
import "./UpdatePassword.scss";
import { useNavigate } from "react-router-dom";
import Request from "../../utils/request";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";
// import Cookies from "universal-cookie";
// import jwtDecode from "jwt-decode";

function UpdatePassword() {
  const navigate = useNavigate();
  //   const cookies = new Cookies();

  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");

  const [snackbar, setSnakebar] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    isWarning: false,
    msg: "",
  });

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState({
    showSuccessModal: false,
    ShowWarningModal: false,
    msg: "",
  });

  const handleClose = () => {
    setSnakebar({ ...snackbar, open: false });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  let onSuccessCloseErrorModal = () => {
    setShow({
      ...show,
      ShowWarningModal: false,
      showSuccessModal: false,
      msg: "",
    });
    navigate("/login");
  };

  let onCloseErrorModal = () => {
    setShow({
      ...show,
      ShowWarningModal: false,
      showSuccessModal: false,
      msg: "",
    });
  };

  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{9,}$/;

  const passwordValidation = re.test(String(password));

  let validateRequest = () => {
    if (!otpCode) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Otp-Code is missing",
      });
    } else if (!password) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Password is missing",
      });
    } else if (!passwordValidation) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Please choose a more secure password. password must be greater than 8 characters long and contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character",
      });
    } else {
      return true;
    }
  };

  let handleSubmit = async (e) => {
    event.preventDefault();

    let validate = validateRequest();

    if (validate) {
      setSnakebar({
        ...snackbar,
        isWarning: false,
      });
      setOpen(true);

      try {
        const response = await Request.patch("/users/updatePassword", {
          otpCode,
          password,
        })
          .then((res) => {
            setOpen(false);
            console.log(res.data);

            setShow({
              ...show,
              showSuccessModal: true,
              msg: "Password Updated Successfully",
            });
            // localStorage.setItem("currentUser", JSON.stringify(res.data.info));

            // cookies.set("accessToken", res.data.token, {
            //   path: "/",
            //   expires: 3600000,
            // });
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
    }
  };

  return (
    <div className="login">
      {snackbar.isWarning && (
        <ErrorMessageAlert snackbar={snackbar} onClose={handleClose} />
      )}
      <form onSubmit={handleSubmit}>
        <h1>Update Password</h1>
        <label htmlFor="">Otp-Code</label>
        <input
          name="otpCode"
          type="text"
          placeholder="Please enter Otp-Code"
          onChange={(e) => setOtpCode(e.target.value)}
        />

        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Update Password</button>
      </form>
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

export default UpdatePassword;
