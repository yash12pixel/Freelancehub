const express = require("express");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const upload = require("../utils/imageUpload");
const fs = require("fs");
const sendEmail = require("../utils/email.utility");
const config = require("../config/email.config");
const uuid = require("uuid");
const dotenv = require("dotenv");
const { log } = require("console");
dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploader = async (path) =>
  await cloudinary.uploader.upload(path, "memories");

router.post("/register", upload.single("file"), async (req, res, next) => {
  const { username, email, password, country, phone, desc, isSeller } =
    req.body;
  let url;
  const file = req.file;
  console.log("file::", file);
  console.log("body data", req.body);
  try {
    const checkEmailExist = await User.findOne({
      email: email,
    });
    const checkUsername = await User.findOne({
      username: username,
    });
    if (!username) {
      res.status(400).json({ success: false, message: "Username is required" });
    } else if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
    } else if (!password) {
      res.status(400).json({ success: false, message: "Password is required" });
    } else if (!country) {
      res.status(400).json({ success: false, message: "Country is required" });
    }
    // else if (isSeller === "true") {
    //   console.log("seller log");
    //   if (!phone || !desc) {
    //     console.log("cond log");
    //     res.status(400).json({
    //       success: false,
    //       message: "Phone & Description are required",
    //     });
    //   }
    // }
    else {
      console.log("else log");
      if (checkEmailExist) {
        console.log("email log");

        res.status(400).json({
          success: false,
          message: "this email has already been taken. Please try different",
        });
      } else if (checkUsername) {
        console.log("username log");

        res.status(400).json({
          success: false,
          message: "this username has already been taken. Please try different",
        });
      } else {
        console.log("else log2");

        if (file) {
          console.log("file log");

          const { path } = file;
          const newPath = await uploader(path);
          url = {
            public_id: newPath.public_id,
            asset_id: newPath.asset_id,
            version_id: newPath.version_id,
            width: newPath.width,
            height: newPath.height,
            format: newPath.format,
            original_filename: newPath.original_filename,
            url: newPath.url,
          };
          //   console.log("urls::", url);
          fs.unlinkSync(path);

          const token = uuid.v4();

          let { delivered } = await sendEmail(
            email,
            config.email.accountVerification,
            config.email.template.accountVerification(username, token)
          );

          if (!delivered) {
            res.status(400).json({
              success: false,
              message: "We are facing some network problems to send email",
            });
          } else {
            const hash = bcrypt.hashSync(password, 5);
            const newUser = new User({
              ...req.body,
              password: hash,
              img: url,
              verificationToken: token,
            });

            await newUser.save();
            res.status(201).json({ success: true, data: newUser });
          }
        } else {
          const hash = bcrypt.hashSync(password, 5);
          const newUser = new User({
            ...req.body,
            password: hash,
          });

          await newUser.save();
          res.status(201).json({ success: true, data: newUser });
        }
      }
    }
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.post("/verifyEmail", async (req, res, next) => {
  const token = req.body.verificationToken;
  try {
    const checkToken = await User.findOne({
      verificationToken: token,
    });
    if (!checkToken) {
      res.send("invalid token");
    } else if (checkToken.verified == true) {
      console.log("yes");
      res.send("You are already verified");
    } else {
      checkToken.verified = true;
      await checkToken.save();

      let { delivered } = await sendEmail(
        checkToken.email,
        config.email.accountActivationSubject,
        config.email.template.accountActivationEmail(checkToken.email)
      );

      if (!delivered) {
        res.send("Email not sent");
      }

      res.send("verified successfully");
    }
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.post("/login", async (req, res, next) => {
  const username = req.body.username;
  const userPassword = req.body.password;

  try {
    const user = await User.findOne({ username: username });

    if (!user)
      return next(
        res.status(400).json({ success: false, message: "User not found!" })
      );
    if (user.verified == false) {
      return next(
        res
          .status(400)
          .json({ success: false, message: "Please verify your account first" })
      );
    } else {
      const isCorrect = bcrypt.compareSync(userPassword, user.password);
      if (!isCorrect)
        return next(
          res.status(400).json({ success: false, message: "Wrong password" })
        );

      const token = jwt.sign(
        {
          id: user._id,
          isSeller: user.isSeller,
        },
        process.env.JWT_KEY
      );

      const { password, ...info } = user._doc;

      return res.status(200).json({ info, token });
    }
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    res
      .clearCookie("accessToken", {
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User has been logged out.");
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

module.exports = router;
