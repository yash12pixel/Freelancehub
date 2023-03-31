import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Request from "../../utils/request";
import "./Success.scss";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");

  const dataFetchedRef = useRef(false);

  const makeRequest = async () => {
    try {
      await Request.put("/orders/confirmOrder", { payment_intent });
      setTimeout(() => {
        navigate("/orders");
      }, 5000);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    makeRequest();
  }, []);
  return (
    <div className="success">
      Payment successful. You are being redirected to the orders page. Please do
      not close the page
    </div>
  );
};

export default Success;
