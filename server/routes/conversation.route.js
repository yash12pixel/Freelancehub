const express = require("express");
const verifyToken = require("../middleware/jwt");
const Conversation = require("../models/conversation.model");
const passport = require("passport");
require("../utils/passport.utility")(passport);
const router = express.Router();

router.post(
  "/createConversation",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const isSeller = req.user.isSeller;
    const userId = req.user._id;
    const to = req.body.to;

    console.log("isseller::", isSeller);
    console.log("userid:", userId);

    try {
      const newConversation = new Conversation({
        id: isSeller ? userId + to : to + userId,
        sellerId: isSeller ? userId : to,
        buyerId: isSeller ? to : userId,
        readBySeller: isSeller,
        readByBuyer: !isSeller,
      });

      const savedConversation = await newConversation.save();
      res.status(201).send(savedConversation);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.patch(
  "/updateConversation/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;
    const isSeller = req.user.isSeller;

    try {
      const updatedConversation = await Conversation.findOneAndUpdate(
        { id: id },
        {
          $set: {
            ...(isSeller ? { readBySeller: true } : { readByBuyer: true }),
          },
        },
        { new: true }
      );

      res.status(200).send(updatedConversation);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get(
  "/getSingleConversation/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;
    console.log("id:::", id);
    try {
      const conversation = await Conversation.findOne({ id: id });
      if (!conversation) {
        return next(
          res
            .status(404)
            .json({ success: false, message: "Conversation not found!" })
        );
      }
      console.log("conver::", conversation);
      res.status(200).send(conversation);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get(
  "/getConversations",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const isSeller = req.user.isSeller;
    const userId = req.user._id;

    try {
      const conversations = await Conversation.find(
        isSeller ? { sellerId: userId } : { buyerId: userId }
      );
      res.status(200).send(conversations);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

module.exports = router;
