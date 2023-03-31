const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  //   console.log("token::", req.cookies);

  if (!token)
    return next(
      res
        .status(401)
        .json({ success: false, message: "You are not authenticated!" })
    );

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err)
      return next(
        res.status(403).json({ success: false, message: "Token is not valid!" })
      );
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    next();
  });
};

module.exports = verifyToken;
