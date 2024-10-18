module.exports = (sequelize, DataTypes) => {
  const PaymentDetails = sequelize.define(
    "paymentDetails",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.STRING,
      },
      currency: {
        type: DataTypes.STRING,
      },
      razorpayOrderId: {
        type: DataTypes.STRING,
      },
      razorpayPaymentId: {
        type: DataTypes.STRING,
      },
      razorpayTime: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.STRING,
      },
      verify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { paranoid: true }
  );
  return PaymentDetails;
};
