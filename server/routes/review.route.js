const express = require("express");
const verifyToken = require("../middleware/jwt");
const Gig = require("../models/gig.model");
const Review = require("../models/review.model");
const passport = require("passport");
require("../utils/passport.utility")(passport);

const router = express.Router();

router.post(
  "/createReview",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const isSeller = req.user.isSeller;
    const userId = req.user._id;
    const gigId = req.body.gigId;
    const desc = req.body.desc;
    const star = req.body.star;

    try {
      if (isSeller) {
        return next(
          res.status(403).json({
            success: false,
            message: "Sellers can't create a review!",
          })
        );
      } else if (!gigId) {
        next(
          res
            .status(400)
            .json({ success: false, message: "GigId is required!" })
        );
      } else if (!desc) {
        next(
          res
            .status(400)
            .json({ success: false, message: "Description is required!" })
        );
      } else if (!star) {
        next(
          res.status(400).json({ success: false, message: "Star is required!" })
        );
      } else {
        const review = await Review.findOne({
          gigId: gigId,
          userId: userId,
        });

        const gig = await Gig.findById({
          _id: gigId,
        });

        if (review) {
          return next(
            res.status(403).json({
              success: false,
              message: "You have already created a review for this gig!",
            })
          );
        } else if (!gig) {
          return next(
            res.status(400).json({
              success: false,
              message: "Gig not found!",
            })
          );
        } else {
          const newReview = new Review({
            userId: userId,
            gigId: gigId,
            desc: desc,
            star: star,
          });

          const savedReview = await newReview.save();

          await Gig.findByIdAndUpdate(gigId, {
            $inc: { totalStars: star, starNumber: 1 },
          });

          res.status(201).send(savedReview);
        }
      }
    } catch (error) {
      console.log(error);
      next(res.status(500).json({ success: false, error: error }));
    }
  }
);

router.get("/getReviews/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const reviews = await Review.find({ gigId: id });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.log(error);
    next(res.status(500).json({ success: false, error: error }));
  }
});

module.exports = router;
