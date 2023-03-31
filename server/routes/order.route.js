const express = require("express");
const verifyToken = require("../middleware/jwt");
const Order = require("../models/order.model");
const Gig = require("../models/gig.model");
const Stripe = require("stripe");
const passport = require("passport");
require("../utils/passport.utility")(passport);
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

router.post(
  "/create-payment-intent/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user._id;
    const user = req.user;
    const stripeKey = process.env.STRIPE;
    console.log("user:::::", user._id);

    try {
      const stripe = new Stripe(stripeKey);

      const gig = await Gig.findById(id);

      console.log("user:::::", gig.userId);

      if (!gig) {
        res.status(400).json({ success: false, message: "Gig not found!" });
      } else if (userId == gig.userId) {
        res.status(400).json({
          success: false,
          message: "You can not purchase your own Gig",
        });
      } else {
        const customer = await stripe.customers.create({
          name: user.name,
          email: user.email,
          description: "Software development services",
          shipping: {
            name: user.name,
            address: {
              line1: "510 Townsend St",
              postal_code: "98140",
              city: "San Francisco",
              state: "CA",
              country: "US",
            },
          },
        });

        // console.log("customer::", customer);

        const paymentIntent = await stripe.paymentIntents.create({
          customer: customer.id,
          setup_future_usage: "off_session",
          amount: gig.price * 100,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
          description: "Software development services",
        });

        const newOrder = new Order({
          gigId: gig._id,
          img: gig.cover,
          title: gig.title,
          buyerId: userId,
          sellerId: gig.userId,
          price: gig.price,
          payment_intent: paymentIntent.id,
        });

        await newOrder.save();

        res.status(200).json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          data: newOrder,
        });
      }
    } catch (error) {
      console.log("payment error::", error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.put(
  "/confirmOrder",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const payment_intent = req.body.payment_intent;
    try {
      const isOrderConfirmed = await Order.findOne({
        payment_intent: payment_intent,
      });

      if (!isOrderConfirmed) {
        res
          .status(400)
          .json({ success: false, message: "Payment intent not found!" });
      } else if (isOrderConfirmed.isCompleted == true) {
        res
          .status(400)
          .json({ success: false, message: "Order has confirmed already!" });
      } else {
        const orders = await Order.findOneAndUpdate(
          {
            payment_intent: isOrderConfirmed.payment_intent,
          },
          {
            $set: {
              isCompleted: true,
            },
          }
        );

        //   isOrderConfirmed.isCompleted = true;

        await isOrderConfirmed.save();

        res.status(200).json({ success: true, data: orders });
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get(
  "/getOrders",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const isSeller = req.user.isSeller;
    const userId = req.user._id;

    try {
      const orders = await Order.find({
        ...(isSeller ? { sellerId: userId } : { buyerId: userId }),
        isCompleted: true,
      });
      res.status(200).send(orders);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

module.exports = router;
