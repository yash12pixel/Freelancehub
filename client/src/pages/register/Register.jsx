import React, { useEffect, useState } from "react";
import "./Register.scss";
import Request from "../../utils/request";
import { useNavigate } from "react-router-dom";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import itLocale from "i18n-iso-countries/langs/it.json";
import { Select, MenuItem } from "@mui/material";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    phone: "",
    desc: "",
    isSeller: false,
  });
  console.log("formdata::", formData);
  const [file, setFile] = useState(null);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSnakebar({ open: false, isWarning: false });
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [snackbar]);

  countries.registerLocale(enLocale);
  countries.registerLocale(itLocale);

  const countryObj = countries.getNames("en", { select: "official" });

  const countryArr = Object.entries(countryObj).map(([key, value]) => {
    return {
      label: value,
      value: value,
    };
  });

  let validateRequest = () => {
    const { username, email, country, desc, isSeller, password, phone } =
      formData;
    const re =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{9,}$/;

    const passwordValidation = re.test(String(password));

    const re_email =
      //eslint-disable-next-line
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailValidation = re_email.test(String(email));

    if (username === "" || username === null || username === undefined) {
      //   setValidatedObject({
      //     ...validatedObject,
      //     message: "Username is missing",
      //     isWarning: true,
      //   });
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Username is missing",
      });
    } else if (email === "" || email === null || email === undefined) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Email is missing",
      });
    } else if (!emailValidation) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Please provide valid email",
      });
    } else if (password === "" || password === null || password === undefined) {
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
    } else if (file === "" || file === null || file === undefined) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Profile picture is missing",
      });
    } else if (country === "" || country === null || country === undefined) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Country is missing",
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
      const data = new FormData();
      data.append("file", file);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("country", formData.country);
      data.append("phone", formData.phone);
      data.append("desc", formData.desc);
      data.append("isSeller", formData.isSeller);

      try {
        const response = await Request.post("/auth/register", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then((res) => {
            setOpen(false);
            console.log(res.data.data);
            document.getElementById("signupform").reset();
            setShow({
              ...show,
              showSuccessModal: true,
              msg: "Registration Success",
            });
            localStorage.setItem(
              "verificationToken",
              res.data.data.verificationToken
            );
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
          <h1>Create a new account</h1>
          <label htmlFor="">Username</label>
          <input
            name="username"
            type="text"
            placeholder="johndoe"
            onChange={handleChange}
          />
          <label htmlFor="">Email</label>
          <input
            name="email"
            type="text"
            placeholder="email"
            onChange={handleChange}
          />
          <label htmlFor="">Password</label>
          <input name="password" type="password" onChange={handleChange} />
          <label htmlFor="">Profile Picture</label>
          <input
            type="file"
            name="file"
            id="file"
            onChange={handleFileChange}
          />
          <label htmlFor="">Country</label>
          <Select
            name="country"
            type="text"
            placeholder="Usa"
            onChange={handleChange}>
            {!!countryArr?.length &&
              countryArr.map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
          </Select>
          <button type="submit">Register</button>
        </div>
        <div className="right">
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

export default Register;
