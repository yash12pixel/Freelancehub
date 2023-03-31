import React, { useEffect, useReducer, useState } from "react";
import "./Add.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Request from "../../utils/request";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import getCurrentUser from "../../utils/getCurrentUser";
import ErrorMessageAlert from "../../components/Alert";
import Backdrop from "@mui/material/Backdrop";
import WarningModal from "../../components/Modal/warningModal";
import SuccessModal from "../../components/Modal/successModal";
import CircularProgress from "@mui/material/CircularProgress";

const Add = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [file, setFile] = useState();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    cat: "",
    desc: "",
    shortTitle: "",
    shortDesc: "",
    deliveryTime: "",
    revisionNumber: "",
    price: "",
  });

  const [deliveryTimeValue, setdeliveryTimeValue] = useState();
  const [features, setFeatures] = useState([]);

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState({
    showSuccessModal: false,
    ShowWarningModal: false,
    msg: "",
  });

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const [snackbar, setSnakebar] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    isWarning: false,
    msg: "",
  });

  const handleClose = () => {
    setSnakebar({ ...snackbar, open: false });
  };

  //   console.log(features);
  //   console.log("formdata::", formData);
  //   console.log("files", files);

  let handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleNumberKeyDown = (event) => {
    // Only allow numbers and the minus sign
    if (event.key !== "-" && (isNaN(Number(event.key)) || event.key === " ")) {
      event.preventDefault();
    }

    // Check if the resulting number would be negative
    if (event.target.value === "-0" || event.target.value === "-") {
      event.preventDefault();
    }
  };

  let handleFeature = (e) => {
    e.preventDefault();
    setFeatures([...features, e.target[0].value]);
  };

  let removeFeature = (index) => {
    setFeatures(features.filter((item, i) => i !== index));
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

  let handleFilesUpload = (e) => {
    e.preventDefault();

    // setFiles([...files, e.target.files]);
    const selectedImages = Array.from(e.target.files);
    setFiles([...files, selectedImages]);
  };
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (gig) => {
      return Request.post("/gigs/createGig", gig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  useEffect(() => {
    if (!currentUser.isSeller) {
      navigate("/register");
    }
  }, currentUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSnakebar({ open: false, isWarning: false });
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [snackbar]);

  let validateRequest = () => {
    const {
      title,
      cat,
      desc,
      shortTitle,
      shortDesc,
      deliveryTime,
      revisionNumber,
      price,
    } = formData;

    if (!title) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Service title is missing",
      });
    } else if (!cat) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Category is missing",
      });
    } else if (!file) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Cover image is missing",
      });
    } else if (files.length < 2) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Minimum 2 upload image is required ",
      });
    } else if (!desc) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Description is missing",
      });
    } else if (desc.length < 10) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Please add minimum 10 words in description",
      });
    } else if (!shortTitle) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Service title is missing",
      });
    } else if (!shortDesc) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Short description is missing",
      });
    } else if (shortDesc.length < 10) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Please add minimum 10 words in short description",
      });
    } else if (!deliveryTime) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Delivery time is missing",
      });
    } else if (!revisionNumber) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Revision number is missing",
      });
    } else if (features.length < 1) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Features is missing",
      });
    } else if (!price) {
      setSnakebar({
        ...snackbar,
        open: true,
        horizontal: "center",
        vertical: "top",
        isWarning: true,
        msg: "Price is missing",
      });
    } else {
      return true;
    }
  };

  let handleSubmit = async (event) => {
    event.preventDefault();
    // console.log("yes");
    let validate = validateRequest();

    // console.log("validate", validate);

    if (validate) {
      setSnakebar({
        ...snackbar,
        isWarning: false,
      });
      setOpen(true);
      const data = new FormData();

      files.forEach((file, index) => {
        data.append(`images`, file[0]);
        // console.log("for each images", file[0]);
      });
      data.append("cover", file);
      //   console.log("cover file::", file);
      // data.append("images", files);
      data.append("title", formData.title);
      data.append("cat", formData.cat);
      data.append("desc", formData.desc);
      data.append("shortTitle", formData.shortTitle);
      data.append("shortDesc", formData.shortDesc);
      data.append("deliveryTime", formData.deliveryTime);
      data.append("revisionNumber", formData.revisionNumber);
      data.append("features", features);
      data.append("price", formData.price);

      // console.log("data", data);

      try {
        const response = await Request.post("/gigs/createGig", data, {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then((res) => {
            setOpen(false);
            console.log(res);
            //   document.getElementById("signupform").reset();
            setShow({
              ...show,
              showSuccessModal: true,
              msg: "Gig Added Successfully",
            });
            queryClient.invalidateQueries(["myGigs"]);
            //   localStorage.setItem(
            //     "verificationToken",
            //     res.data.data.verificationToken
            //   );
            navigate("/");
          })
          .catch((error) => {
            setOpen(false);
            setShow({
              ...show,
              ShowWarningModal: true,
              msg: error.response.data.message,
            });
            console.log(error);
          });
        console.log(response);
      } catch (error) {
        setOpen(false);
        console.log(error);
      }
    }
  };

  return (
    <div className="add">
      <div className="container">
        {snackbar.isWarning && (
          <ErrorMessageAlert snackbar={snackbar} onClose={handleClose} />
        )}
        <h1>Add New Gig</h1>
        <div className="sections">
          <div className="info">
            <label htmlFor="">Service Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
            />
            <label htmlFor="">Category</label>
            <select name="cat" id="cat" onChange={handleChange}>
              <option value="design">Design</option>
              <option value="web">Web Development</option>
              <option value="animation">Animation</option>
              <option value="music">Music</option>
            </select>
            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image</label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="">Upload Images</label>
                <input
                  type="file"
                  id="files"
                  multiple
                  onChange={handleFilesUpload}
                />
              </div>
              {/* <button> */}
              {/* {uploading ? "uploading" : "Upload"} */}
              {/* Upload */}
              {/* </button> */}
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="desc"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}></textarea>
            <button onClick={handleSubmit}>Create</button>
          </div>
          <div className="details">
            <label htmlFor="">Short Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
            />
            <label htmlFor="">Short Description</label>
            <textarea
              name="shortDesc"
              onChange={handleChange}
              id=""
              placeholder="Short description of your service"
              cols="30"
              rows="10"></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input
              type="number"
              name="deliveryTime"
              min="0"
              onChange={handleChange}
            />
            <label htmlFor="">Revision Number</label>
            <input
              type="number"
              name="revisionNumber"
              min="0"
              onChange={handleChange}
            />
            <label htmlFor="">Add Features</label>
            <form action="" className="add" onSubmit={handleFeature}>
              <input
                type="text"
                name="feature"
                placeholder="e.g. page design"
              />
              <button type="submit">add</button>
            </form>
            <div className="addedFeatures">
              {features?.map((feature, index) => (
                <div className="item" key={index}>
                  <button
                    onClick={() =>
                      //   dispatch({ type: "REMOVE_FEATURE", payload: f })
                      removeFeature(index)
                    }>
                    {feature}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="">Price</label>
            <input type="number" min="0" onChange={handleChange} name="price" />

            {/* {files.map((image) => {
                console.log("image");
              if (!image || !image.type.startsWith("image/")) return null; // Check if image is valid
              const reader = new FileReader();
              reader.readAsDataURL(image);
              return (
                <img key={image.name} src={reader.result} alt={image.name} />
              );
            })} */}
          </div>
        </div>
      </div>
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

export default Add;
