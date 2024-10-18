const dbConfig = require("../Config/db.config.js");

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

const db = {};

const queryInterface = sequelize.getQueryInterface();

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.emailCredential = require("./emailCredentialsModel.js")(
  sequelize,
  Sequelize
);
db.paymentDetails = require("./paymentDetailsModel.js")(sequelize, Sequelize);
db.user = require("./userModel.js")(sequelize, Sequelize);
db.emailOTP = require("./emailOTPModel.js")(sequelize, Sequelize);

// db.emailCredential.findOne({
//     where: {
//         email: process.env.EMAIL
//     }
// }).then((res) => {
//     if (!res) {
//         db.emailCredential.create({
//             email: process.env.EMAIL,
//             plateForm: "BREVO",
//             EMAIL_API_KEY: process.env.EMAIL_API_KEY
//         });
//     }
// }).catch((err) => { console.log(err) });

module.exports = db;
