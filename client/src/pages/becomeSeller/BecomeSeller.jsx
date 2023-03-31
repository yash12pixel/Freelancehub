import React, { useEffect, useState } from "react";
import "./BecomeSeller.scss";
import Request from "../../utils/request";
import { useNavigate } from "react-router-dom";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    desc: "",
    isSeller: false,
  });
  console.log("formdata::", formData);
  //   const [file, setFile] = useState(null);
  //   const [validatedObject, setValidatedObject] = useState({
  //     isWarning: false,
  //     message: "",
  //   });
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState({
    showSuccessModal: false,
    ShowWarningModal: false,
    msg: "",
  });
  const [snackbar, setSnakebar] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    isWarning: false,
    msg: "",
  });

  // console.log("snackbar:::", snackbar);

  const handleClose = () => {
    console.log("yes close");
    setSnakebar({ open: false, isWarning: false });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSeller = (event) => {
    setFormData({ ...formData, isSeller: event.target.checked ? true : false });
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSnakebar({ open: false, isWarning: false });
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [snackbar]);

  let validateRequest = () => {
    const { desc, isSeller, phone } = formData;

    if (isSeller === false) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Activate the seller toggle",
      });
    } else if (
      (isSeller === true && phone === "") ||
      phone === null ||
      phone === undefined
    ) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Phone is missing",
      });
    } else if (
      (isSeller === true && desc === "") ||
      desc === null ||
      desc === undefined
    ) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Description is missing",
      });
    } else {
      return true;
    }
  };

  let handleSubmit = async (event) => {
    event.preventDefault();

    let validate = validateRequest();

    console.log("validate", validate);

    if (validate) {
      setSnakebar({
        ...snackbar,
        isWarning: false,
        open: false,
      });
      setOpen(true);

      try {
        const response = await Request.patch("/users/becomeSeller", formData)
          .then((res) => {
            setOpen(false);
            console.log(res.data.data);
            document.getElementById("signupform").reset();
            setShow({
              ...show,
              showSuccessModal: true,
              msg: "You are became a seller now",
            });
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
    <div className="register">
      <form onSubmit={handleSubmit} id="signupform">
        <div className="left">
          {snackbar.open && (
            <ErrorMessageAlert snackbar={snackbar} onClose={handleClose} />
          )}
          {/* <h1>Create a new account</h1> */}

          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          {formData.isSeller === true && (
            <>
              <label htmlFor="">Phone Number</label>
              <input
                name="phone"
                type="text"
                placeholder="+1 234 567 89"
                onChange={handleChange}
              />
              <label htmlFor="">Description</label>
              <textarea
                placeholder="A short description of yourself"
                name="desc"
                id=""
                cols="30"
                rows="10"
                onChange={handleChange}></textarea>
              <button type="submit">Register</button>
            </>
          )}
        </div>
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
};

export default BecomeSeller;
