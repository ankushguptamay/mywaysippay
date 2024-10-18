const brevo = require("@getbrevo/brevo");
const otpGenerator = require("otp-generator");

exports.sendEmail = (options) => {
  return new Promise((resolve, reject) => {
    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = options.brevoKey;
    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.sender = { name: "My Way SIP", email: options.brevoEmail };
    sendSmtpEmail.replyTo = { email: options.brevoEmail, name: "My Way SIP" };
    sendSmtpEmail.headers = options.headers;
    sendSmtpEmail.htmlContent = options.htmlContent;
    sendSmtpEmail.to = [{ email: options.userEmail, name: options.userName }];
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        resolve(JSON.stringify(data));
      },
      function (error) {
        reject(error);
      }
    );
  });
};
exports.generateFixedLengthRandomNumber = (numberOfDigits) => {
  return otpGenerator.generate(numberOfDigits, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};
