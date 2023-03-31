import React, { useEffect, useState } from "react";
import "./ForgetPassword.scss";
import { useNavigate } from "react-router-dom";
import Request from "../../utils/request";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";
import getCurrentUser from "../../utils/getCurrentUser";
// import Cookies from "universal-cookie";
// import jwtDecode from "jwt-decode";

function ForgetPassword() {
  const navigate = useNavigate();
  //   const cookies = new Cookies();
  const currentUser = getCurrentUser();

  const [email, setEmail] = useState("");

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
    navigate("/updatePass");
  };

  let onCloseErrorModal = () => {
    setShow({
      ...show,
      ShowWarningModal: false,
      showSuccessModal: false,
      msg: "",
    });
  };

  //   useEffect(() => {
  //     if (currentUser) {
  //       setSnakebar({
  //         ...snackbar,
  //         open: true,
  //         horizontal: "center",
  //         vertical: "top",
  //         isWarning: true,
  //         msg: "Please Logout First",
  //       });
  //       navigate("/");
  //     }
  //   }, []);

  let validateRequest = () => {
    if (!email) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Email is missing",
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
        const response = await Request.patch("/users/forgotCredential", {
          email,
        })
          .then((res) => {
            setOpen(false);
            console.log(res.data);

            setShow({
              ...show,
              showSuccessModal: true,
              msg: "Otp Sent Successfully On Your Email",
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
        <h1>Forget Password</h1>
        <label htmlFor="">Email</label>
        <input
          name="username"
          type="text"
          placeholder="johndoe"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Submit</button>
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

export default ForgetPassword;
