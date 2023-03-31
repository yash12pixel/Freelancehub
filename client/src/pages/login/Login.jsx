import React, { useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import Request from "../../utils/request";
import "./Login.scss";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";
// import Cookies from "universal-cookie";
// import jwtDecode from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  //   const cookies = new Cookies();

  const [username, setUsername] = useState("");
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

  let validateRequest = () => {
    if (!username) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Username is missing",
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
        const response = await Request.post("/auth/login", {
          username,
          password,
        })
          .then((res) => {
            setOpen(false);
            console.log(res.data);

            setShow({
              ...show,
              showSuccessModal: true,
              msg: "Login Success",
            });
            // localStorage.setItem("currentUser", JSON.stringify(res.data.info));
            // localStorage.setItem("token", res.data.token);
            // const decodedUser = jwtDecode(accessToken);
            localStorage.setItem("currentUser", JSON.stringify(res.data.info));

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
        <h1>Sign in</h1>
        <label htmlFor="">Username</label>
        <input
          name="username"
          type="text"
          placeholder="johndoe"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Link to="/forgetPass">Forget Your Password ?</Link>
        {/* <a href="/forgetPass" style={{ margin: "0 94px" }}>
          Forget Your Password ?
        </a> */}
        <button type="submit">Login</button>
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

export default Login;
