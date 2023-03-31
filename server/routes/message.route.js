const express = require("express");
const verifyToken = require("../middleware/jwt");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const passport = require("passport");
require("../utils/passport.utility")(passport);

const router = express.Router();

router.post(
  "/createMessage",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const conversationId = req.body.conversationId;
    const desc = req.body.desc;
    const userId = req.user._id;
    const isSeller = req.user.isSeller;

    try {
      const newMessage = new Message({
        conversationId: conversationId,
        userId: userId,
        desc: desc,
      });

      const savedMessage = await newMessage.save();

      await Conversation.findOneAndUpdate(
        { id: conversationId },
        {
          $set: {
            readBySeller: isSeller,
            readByBuyer: !isSeller,
            lastMessage: desc,
          },
        },
        { new: true }
      );
      res.status(201).send(savedMessage);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get(
  "/getMessages/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;

    try {
      const messages = await Message.find({
        conversationId: id,
      });

      // console.log("message:::", messages);
      res.status(200).send(messages);
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

module.exports = router;
