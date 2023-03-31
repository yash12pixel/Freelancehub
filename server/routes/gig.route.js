const express = require("express");
const verifyToken = require("../middleware/jwt");
const Gig = require("../models/gig.model");
const upload = require("../utils/imageUpload");
const cloudinary = require("cloudinary");
const fs = require("fs");
const passport = require("passport");
require("../utils/passport.utility")(passport);
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploader = async (path) =>
  await cloudinary.uploader.upload(path, "memories");

router.post(
  "/createGig",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res, next) => {
    const {
      title,
      desc,
      cat,
      price,
      shortTitle,
      shortDesc,
      deliveryTime,
      revisionNumber,
    } = req.body;
    const cover = req.files["cover"][0];
    let coverUrl;
    const images = req.files["images"];
    let urls = [];
    const user = req.user;
    console.log("images::", images);
    console.log("cover::", cover);

    try {
      if (!user.isSeller) {
        res.status(403).json({
          success: false,
          message: "Only sellers can create a gig!",
        });
      } else if (!title) {
        next(
          res.status(400).json({ success: false, message: "Title is required" })
        );
      } else if (!desc) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Description is required" })
        );
      } else if (!cat) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Category is required" })
        );
      } else if (!price) {
        next(
          res.status(400).json({ success: false, message: "Price is required" })
        );
      } else if (!shortTitle) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Short title is required" })
        );
      } else if (!shortDesc) {
        next(
          res.status(400).json({
            success: false,
            message: "Short description is required",
          })
        );
      } else if (!deliveryTime) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Delivery time is required" })
        );
      } else if (!revisionNumber) {
        next(
          res.status(400).json({
            success: false,
            message: "Revision number is required",
          })
        );
      } else {
        if (cover) {
          const { path } = cover;
          const newPath = await uploader(path);
          coverUrl = {
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
        }
        if (images) {
          for (const file of images) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push({
              public_id: newPath.public_id,
              asset_id: newPath.asset_id,
              version_id: newPath.version_id,
              width: newPath.width,
              height: newPath.height,
              format: newPath.format,
              original_filename: newPath.original_filename,
              url: newPath.url,
            });
            fs.unlinkSync(path);
          }
        }
        const newGig = new Gig({
          userId: user._id,
          ...req.body,
          cover: coverUrl,
          images: urls,
        });

        const savedGig = await newGig.save();
        res.status(201).json({ success: true, data: savedGig });
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get("/getGigs", async (req, res, next) => {
  try {
    const q = req.query;
    // const filters = {
    //   ...(q.userId && { userId: q.userId }),
    //   ...(q.cat && { cat: q.cat }),
    //   ...((q.min || q.max) && {
    //     price: {
    //       ...(q.min && { $gte: q.min }),
    //       ...(q.max && { $lte: q.max }),
    //     },
    //   }),
    //   ...(q.search && { title: { $regex: q.search, $options: "i" } }),
    // };

    // console.log("filters:::", filters);

    const filters = {};

    if (q.userId) {
      filters.userId = q.userId;
    }

    if (q.search) {
      filters.$or = [
        { title: { $regex: q.search, $options: "i" } },
        { desc: { $regex: q.search, $options: "i" } },
        { cat: { $regex: q.search, $options: "i" } },
      ];
    }

    if (q.cat) {
      filters.cat = q.cat;
    }

    if (q.min && q.max) {
      filters.price = { $gte: q.min, $lte: q.max };
    } else if (q.min) {
      filters.price = { $gte: q.min };
    } else if (q.max) {
      filters.price = { $lte: q.max };
    }

    console.log("filters::", filters);

    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).json({ success: true, data: gigs });
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.get("/getGig/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const gig = await Gig.findById(id);

    if (!gig) {
      next(res.status(400).json({ success: false, message: "Gig not found!" }));
    }

    res.status(200).json({ success: true, data: gig });
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

router.delete(
  "/deleteGig/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user._id;

    try {
      const gig = await Gig.findById(id);
      console.log("gig user id::", gig.userId);
      console.log("user id::", userId);

      if (!gig) {
        next(
          res.status(400).json({
            success: false,
            message: "Gig not found!",
          })
        );
      } else if (gig.userId != userId) {
        next(
          res.status(403).json({
            success: false,
            message: "You can delete only your gig!",
          })
        );
      } else {
        await Gig.findByIdAndDelete(id);
        res.status(200).send("Gig has been deleted!");
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

module.exports = router;
