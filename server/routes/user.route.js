const express = require("express");
const User = require("../models/user.model");
const verifyToken = require("../middleware/jwt");
const passport = require("passport");
require("../utils/passport.utility")(passport);
const otpGenerator = require("otp-generator");
const {
  getUtcDate,
  comparePassword,
  hashPassword,
} = require("../utils/utils.utility");
const moment = require("moment");
const sendEmail = require("../utils/email.utility");
const config = require("../config/email.config");

const router = express.Router();

router.delete(
  "/deleteUser/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;
    try {
      const user = await User.findById(id);

      if (req.user._id !== user._id.toString()) {
        return next(
          res.status(403).json({
            success: false,
            message: "You can delete only your account!",
          })
        );
      }

      await User.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: "Deleted successfully!" });
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.user._id;
    // console.log("id::", id);
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        next(
          res.status(400).json({ success: false, message: "User not found!" })
        );
      } else {
        res.status(200).json({ success: true, data: user });
        // console.log("data user::", user);
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.patch("/forgotCredential", async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      next(
        res.status(400).json({ success: false, message: "Email is required!" })
      );
    }

    const userRecord = await User.findOne({ email: email });

    if (!userRecord) {
      next(
        res.status(400).json({
          success: false,
          message: `Couldn’t find any account associated with ${email}`,
        })
      );
    }

    let otpNumber = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    let utcDate = getUtcDate();
    let { delivered } = await sendEmail(
      email,
      config.email.forgotSubject,
      config.email.template.emailForgotPassword(otpNumber)
    );
    if (!delivered) {
      return errorResponse(res, ErrorMessages.AUTH.NETOWRK_PROBLEM_ERROR, 400);
    }

    const updateOtp = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          otpCode: otpNumber,
          otpCreateTime: utcDate,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updateOtp });
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.patch("/updatePassword", async (req, res, next) => {
  const { otpCode, password } = req.body;
  try {
    if (!otpCode) {
      next(
        res
          .status(400)
          .json({ success: false, messsage: "Otp-Code is required!" })
      );
    } else if (!password) {
      next(
        res.status(400).json({ success: false, message: "Password is missing" })
      );
    } else {
      const userRecord = await User.findOne({ otpCode: otpCode });

      if (!userRecord) {
        next(
          res.status(400).json({
            success: false,
            message:
              "The number that you've entered doesn't match your code. Please try again.",
          })
        );
      }

      var utcMoment = moment.utc();
      var utcDate = new Date(utcMoment.format());
      var diff =
        (utcDate.getTime() - userRecord.otpCreateTime.getTime()) / 1000;
      const diffInMinute = diff / 60;

      if (diffInMinute > config.otpExpireTime) {
        next(
          res.status(400).json({
            success: false,
            message:
              "Your OTP code has been expired. Click on send again to get new code",
          })
        );
      }

      let hash = await hashPassword(password);

      let updatePassword = await User.findOneAndUpdate(
        { otpCode: otpCode },
        {
          $set: {
            password: hash,
            otpCode: 0,
          },
        },
        { new: true }
      );

      return res.status(200).json({ success: false, data: updatePassword });
    }
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.patch(
  "/becomeSeller",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { isSeller, phone, desc } = req.body;
    const userId = req.user._id;
    const user = await User.findById({ _id: userId });
    console.log("body seller:::", req.body);
    console.log("body user:::", req.user);

    try {
      if (isSeller == "true" && !phone) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Phone number is required" })
        );
      } else if (isSeller == "true" && !desc) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Description is required" })
        );
      } else {
        const user = await User.findById({ _id: userId });
        if (!user) {
          next(
            res.status(400).json({ success: false, message: "User not found" })
          );
        } else if (user.isSeller === true) {
          next(
            res
              .status(400)
              .json({ success: false, message: "You are already a seller" })
          );
        } else {
          const becomeSeller = await User.findByIdAndUpdate(
            { _id: userId },
            {
              $set: {
                isSeller: true,
                phone: phone,
                desc: desc,
              },
            },
            { new: true }
          );

          return res.status(200).json({ success: true, data: becomeSeller });
        }
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

module.exports = router;
