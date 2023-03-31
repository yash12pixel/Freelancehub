import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "flickity/css/flickity.css";

import Navbar from "./components/navbar/Navbar";

import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import ConfirmEmail from "./pages/confirmEmail/ConfirmEmail";
import Login from "./pages/login/Login";
import Add from "./pages/add/Add";
import MyGigs from "./pages/myGigs/MyGigs";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import Orders from "./pages/orders/Orders";
import Message from "./pages/message/Message";
import Messages from "./pages/messages/Messages";
import ForgetPassword from "./pages/forgetPassword/ForgetPassword";
import UpdatePassword from "./pages/updatePassword/UpdatePassword";
import BecomeSeller from "./pages/becomeSeller/BecomeSeller";
import SearchGigs from "./pages/searchGigs/SearchGigs";
import Footer from "./pages/footer/Footer";

const App = () => {
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <div className="app">
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <Outlet />
          <Footer />
        </QueryClientProvider>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/confirm-email",
          element: <ConfirmEmail />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/add",
          element: <Add />,
        },
        {
          path: "/myGigs",
          element: <MyGigs />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        // {
        //   path: "/messages",
        //   element: <Messages />,
        // },
        // {
        //   path: "/message/:id",
        //   element: <Message />,
        // },
        {
          path: "/gigs",
          element: <Gigs />,
        },
        {
          path: "/searchGigs",
          element: <SearchGigs />,
        },
        {
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          path: "/pay/:id",
          element: <Pay />,
        },
        {
          path: "/success",
          element: <Success />,
        },
        {
          path: "/forgetPass",
          element: <ForgetPassword />,
        },
        {
          path: "/updatePass",
          element: <UpdatePassword />,
        },
        {
          path: "/becomeSeller",
          element: <BecomeSeller />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
