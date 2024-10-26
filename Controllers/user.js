const { Op } = require("sequelize");
const db = require("../Models");
const {
  loginUser,
  forgotPassword,
  forgotPasswordOtpVerification,
  changePassword,
  confirmOldPassword,
  updateName,
} = require("../Middlewares/validate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../Util/generatePassword");
const {
  generateFixedLengthRandomNumber,
  sendEmail,
} = require("../Util/sendEmail");
const User = db.user;
const EmailCredential = db.emailCredential;
const PaymentDetails = db.paymentDetails;
const EmailOTP = db.emailOTP;

exports.login = async (req, res) => {
  // Validate body
  const { error } = loginUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Sorry! try to login with correct credentials.",
      });
    }
    const compairPassword = await bcrypt.compare(password, user.password);
    if (!compairPassword) {
      return res.status(400).send({
        success: false,
        message: "Sorry! try to login with correct credentials.",
      });
    }

    const data = {
      id: user.id,
      email: user.email,
    };
    const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
    res.status(201).send({
      success: true,
      message: "Loged in successfully",
      authToken: authToken,
      user,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.user = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User is not present!",
      });
    }
    res.status(201).send({
      success: true,
      message: "Successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.heartAPI = async (req, res) => {
  try {
    await User.findOne({ where: { id: "sbdasu" } });
    res.status(201).send({
      success: true,
      message: "Heart API fired",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.paymentDetails = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User is not present!",
      });
    }
    const details = await PaymentDetails.findAll({
      where: { userId: req.user.id, status: "paid", verify: true },
    });
    res.status(201).send({
      success: true,
      message: "Successfully",
      data: details,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.webHook = async (req, res) => {
  try {
    // Price
    const amount = req.body.payload.payment.entity.amount;
    // On Success payment
    if (req.body.event === "payment.captured") {
      const email = req.body.payload.payment.entity.email;
      const contact = req.body.payload.payment.entity.notes.whatsapp_number;
      // Find user
      let isUser = await User.findOne({
        where: {
          email: email,
        },
      });
      const headers = { "Thank you mail": "my-way-sip" };
      let htmlContent = `
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
                    <div style="width: 80%; margin: auto; overflow: hidden;">
                    </div>
                    <div style="width: 80%; margin: auto;">
                        <h2 style="text-align: center;">Welcome to the Brokerji.com!</h2>
                        <p>Thank you to purchase our stock.</p>
                          <p><strong>Login Url:</strong>https://services.brokerji.com/</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p>Make sure you save this email in case you ever need it.</p>
                        <p>See you on the inside!</p>
                        <p>The Brokerji Team</p>
                        <p>
                        <strong>IMPORTANT MESSAGE:</strong> We are dedicated to customer support, and solving your problems. If you experience any technical issues with our system, compensation plan, or have a billing question -- please email us at <a href="mailto:support@brokerji.com">support@brokerji.com</a>
                        </p>
                    </div>
                </body>`;
      // If user is new
      if (!isUser) {
        // Generate password
        const password = generatePassword(email);
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);
        // Store in database
        isUser = await User.create({
          email: email,
          mobileNumber: contact,
          name: req.body.payload.payment.entity.notes.name,
          password: bcPassword,
        });
        // Set HTML content for email
        htmlContent = `
                   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
                    <div style="width: 80%; margin: auto; overflow: hidden;">
                    </div>
                    <div style="width: 80%; margin: auto;">
                        <h2 style="text-align: center;">Welcome to the Brokerji.com</h2>
                        <p>Thank you to purchase our stock.</p>
                        <p><strong>Login Url:</strong>https://services.brokerji.com/</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password :</strong> ${password}</p>
                        <p>Make sure you save this email in case you ever need it.</p>
                        <p>See you on the inside!</p>
                        <p>The Brokerji Team</p>
                        <p>
                            <strong>IMPORTANT MESSAGE:</strong> We are dedicated to customer support, and solving your problems. If you experience any technical issues with our system, compensation plan, or have a billing question -- please email us at <a href="mailto:support@brokerji.com">support@brokerji.com</a>
                        </p>
                    </div>
                </body>`;
      }

      // Payment Details
      await PaymentDetails.create({
        userId: isUser.dataValues.id,
        verify: true,
        status: "paid",
        amount: amount / 100,
        method: req.body.payload.payment.entity.method,
        currency: req.body.payload.payment.entity.currency,
        vpa: req.body.payload.payment.entity.vpa,
        razorpayOrderId: req.body.payload.payment.entity.order_id,
        razorpayTime: req.body.payload.payment.entity.created_at,
        razorpayPaymentId: req.body.payload.payment.entity.id,
      });

      // Update sendEmail 0 every day
      const date = JSON.stringify(new Date());
      const todayDate = `${date.slice(1, 11)}`;
      const changeUpdateDate = await EmailCredential.findAll({
        where: { updatedAt: { [Op.lt]: todayDate } },
        order: [["createdAt", "ASC"]],
      });
      for (let i = 0; i < changeUpdateDate.length; i++) {
        await EmailCredential.update(
          { emailSend: 0 },
          { where: { id: changeUpdateDate[i].id } }
        );
      }
      // finalise email credentiel
      const emailCredential = await EmailCredential.findAll({
        order: [["createdAt", "ASC"]],
      });
      let finaliseEmailCredential;
      for (let i = 0; i < emailCredential.length; i++) {
        if (parseInt(emailCredential[i].emailSend) < 300) {
          finaliseEmailCredential = emailCredential[i];
          break;
        }
      }
      if (finaliseEmailCredential) {
        // Send OTP to Email By Brevo
        if (finaliseEmailCredential.plateForm === "BREVO") {
          const options = {
            brevoEmail: finaliseEmailCredential.email,
            brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
            headers,
            subject: "Thank You",
            htmlContent,
            userEmail: email,
            userName: "User",
          };

          await sendEmail(options);

          const increaseNumber =
            parseInt(finaliseEmailCredential.emailSend) + 1;
          await EmailCredential.update(
            { emailSend: increaseNumber },
            { where: { id: finaliseEmailCredential.id } }
          );
        }
      }

      res.status(201).send({
        success: true,
        message: `webHookData get successfully!`,
      });
    } else {
      res.status(400).send({
        success: false,
        message: `Unexpected error!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  // Validate body
  const { error } = forgotPassword(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Sorry! try to login with correct credentials.",
      });
    }
    // Update sendEmail 0 every day
    const date = JSON.stringify(new Date());
    const todayDate = `${date.slice(1, 11)}`;
    const changeUpdateDate = await EmailCredential.findAll({
      where: { updatedAt: { [Op.lt]: todayDate } },
      order: [["createdAt", "ASC"]],
    });
    for (let i = 0; i < changeUpdateDate.length; i++) {
      await EmailCredential.update(
        { emailSend: 0 },
        { where: { id: changeUpdateDate[i].id } }
      );
    }
    // finalise email credentiel
    const emailCredential = await EmailCredential.findAll({
      order: [["createdAt", "ASC"]],
    });
    let finaliseEmailCredential;
    for (let i = 0; i < emailCredential.length; i++) {
      if (parseInt(emailCredential[i].emailSend) < 300) {
        finaliseEmailCredential = emailCredential[i];
        break;
      }
    }
    if (finaliseEmailCredential) {
      // Send OTP to Email By Brevo
      if (finaliseEmailCredential.plateForm === "BREVO") {
        // Generate OTP for Email
        const otp = generateFixedLengthRandomNumber(
          process.env.OTP_DIGITS_LENGTH
        );
        const options = {
          brevoEmail: finaliseEmailCredential.email,
          brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
          headers: { "OTP for verification": "123A" },
          subject: "Thank You",
          htmlContent: `OTP ${otp}`,
          userEmail: email,
          userName: "User",
        };

        await sendEmail(options);

        const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
        await EmailCredential.update(
          { emailSend: increaseNumber },
          { where: { id: finaliseEmailCredential.id } }
        );
        // Store OTP
        await EmailOTP.create({
          validTill:
            new Date().getTime() +
            parseInt(process.env.OTP_VALIDITY_IN_MILLISECONDS),
          otp: otp,
          receiverId: user.id,
          email,
        });
      }
    }
    res.status(200).send({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.forgotPasswordOtpVerification = async (req, res) => {
  try {
    // Validate body
    const { error } = forgotPasswordOtpVerification(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { email, otp } = req.body;
    // Is Mobile Otp exist
    const isOtp = await EmailOTP.findOne({ where: { otp, email } });
    if (!isOtp) {
      return res.status(400).send({
        success: false,
        message: `Invalid OTP!`,
      });
    }
    // Checking is user present or not
    const user = await User.findOne({ where: { id: receiverId } });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "No user Found!",
      });
    }
    // is email otp expired?
    const isOtpExpired = new Date().getTime() > parseInt(isOtp.validTill);
    await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
    if (isOtpExpired) {
      return res.status(400).send({
        success: false,
        message: `OTP expired!`,
      });
    }
    res.status(201).send({
      success: true,
      message: `VERIFIED!`, // From here redirect to change Password Forgot page
      userId: user.id,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  // Validate body
  const { error } = changePassword(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Sorry! try to login with correct credentials.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const bcPassword = await bcrypt.hash(password, salt);

    await user.update({ password: bcPassword });
    res.status(200).send({
      success: true,
      message: "Successfully!", // From here redirect to login page
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.confirmOldPassword = async (req, res) => {
  // Validate body
  const { error } = confirmOldPassword(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { oldPassword } = req.body;
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User is not present",
      });
    }

    const compairPassword = await bcrypt.compare(oldPassword, user.password);
    if (!compairPassword) {
      return res.status(400).send({
        success: false,
        message: "Incorrect password!",
      });
    }

    res.status(200).send({
      success: true,
      message: "VERIFIED!", // From here redirect to change Password Forgot page
      userId: user.id,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.updateName = async (req, res) => {
  try {
    // Validate body
    const { error } = updateName(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { name } = req.body;
    const user = await User.findOne({
      where: { id: req.user.id, email: req.user.email },
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User is not present!",
      });
    }

    await user.update({ name });
    res.status(200).send({
      success: true,
      message: "Successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};
