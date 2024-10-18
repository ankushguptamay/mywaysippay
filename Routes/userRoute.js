const express = require("express");
const router = express.Router();

const {
  webHook,
  login,
  paymentDetails,
  heartAPI,
  forgotPassword,
  forgotPasswordOtpVerification,
  changePassword,
  confirmOldPassword,
  user,
  updateName,
} = require("../Controllers/user");

//middleware
const { verifyUserToken } = require("../Middlewares/verifyJWT");

router.post("/razorpayWebHook", webHook);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/otpVerification", forgotPasswordOtpVerification);
router.post("/confirmOldPassword", confirmOldPassword);
router.post("/changePassword", changePassword);

router.put("/update", verifyUserToken, updateName);

router.get("/", verifyUserToken, user);
router.get("/payment", verifyUserToken, paymentDetails);

router.get("/heartAPI", heartAPI);

module.exports = router;
