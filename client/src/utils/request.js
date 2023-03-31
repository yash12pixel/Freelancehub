import axios from "axios";

const Request = axios.create({
  baseURL: "http://localhost:5000/api/",
  headers: {
    "Content-type": "application/json",
    Authorization: ` Bearer ${localStorage.getItem("token")}`,
  },

  // withCredentials: true,
});

export default Request;
