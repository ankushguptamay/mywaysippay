module.exports = (sequelize, DataTypes) => {
    const EmailCredential = sequelize.define("emailCredentials", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
        },
        plateForm: {
            type: DataTypes.STRING,
        },
        EMAIL_API_KEY: {
            type: DataTypes.STRING
        },
        emailSend: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    })
    return EmailCredential;
}