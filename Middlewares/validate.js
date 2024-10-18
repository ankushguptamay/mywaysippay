const joi = require("joi");

exports.loginUser = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email().required().label("Email"),
    password: joi.string().required().min(8).max(20),
  });
  return schema.validate(data);
};
exports.forgotPassword = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email().required().label("Email"),
  });
  return schema.validate(data);
};

exports.forgotPasswordOtpVerification = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email().required().label("Email"),
    otp: joi.string().length(6).required(),
  });
  return schema.validate(data);
};

exports.changePassword = (data) => {
  const schema = joi.object().keys({
    userId: joi.string().required(),
    password: joi.string().required().min(8).max(20),
  });
  return schema.validate(data);
};

exports.confirmOldPassword = (data) => {
  const schema = joi.object().keys({
    oldPassword: joi.string().required().min(8).max(20),
  });
  return schema.validate(data);
};

exports.updateName = (data) => {
  const schema = joi.object().keys({
    name: joi.string().required(),
  });
  return schema.validate(data);
};
