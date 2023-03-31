import React, { useEffect, useRef, useState } from "react";
import "./Pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";
import Request from "../../utils/request";

const stripePromise = loadStripe(
  "pk_test_51MmGjrSIiffRSVXtQ8C8h9DJjJK6derTFWmu4zHpfEY4ewwEkvLLgNubmDUFV5asidz5PmyAfsEPgsZS7PgfrUP9002rYiaa3c"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  console.log("secret:::", clientSecret);

  const { id } = useParams();

  const dataFetchedRef = useRef(false);

  const makeRequest = async () => {
    try {
      const res = await Request.post(`/orders/create-payment-intent/${id}`);
      console.log("res stripe::", res.data.clientSecret);
      setClientSecret(res.data.clientSecret);
      return false;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    makeRequest();
  }, []);

  const appearance = {
    theme: "stripe",
  };

  //   const description = "Test payment";
  const options = {
    clientSecret,
    appearance,
    // description,
  };

  return (
    <div className="pay">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default Pay;
