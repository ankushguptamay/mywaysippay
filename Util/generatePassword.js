exports.generatePassword = (email) => {
  let firstSixLetters = email.slice(0, 6);

  firstSixLetters =
    firstSixLetters.charAt(0).toUpperCase() + firstSixLetters.slice(1);

  const randomNumber = Math.floor(Math.random() * 10);

  const specialCharacters = "!@#$%^&*";

  const randomSpecialChar =
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

  // Step 6: Construct the password
  const password = firstSixLetters + randomNumber + randomSpecialChar;

  return password;
};
