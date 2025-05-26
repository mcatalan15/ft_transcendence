const otplib = require('otplib');
const qrcode = require('qrcode');
const { saveTwoFactorSecret, getTwoFactorSecret, enableTwoFactor } = require('../db/database'); // Adjust path as needed

// Configure otplib for TOTP (Time-based One-Time Password)
// Set default values if needed, e.g., for step size or digits
otplib.authenticator.options = {
  step: 30, // Default is 30 seconds
  digits: 6 // Default is 6 digits
};

/**
 * Generates a new TOTP secret and QR code for a user.
 * @param {string} username - The username (or email) for the OTPAuth URL issuer.
 * @param {number} userId - The unique ID of the user.
 * @returns {Promise<object>} An object containing the secret, QR code data URL, and otpAuthUrl.
 */
async function generateTwoFaSetup(username, userId) {
  // 1. Generate a new TOTP secret
  const secret = otplib.authenticator.generateSecret();
  console.log(`Generated 2FA secret for user ${userId}: ${secret}`);

  // 2. Save the secret to the database (linked to the user)
  // This is crucial for later verification
  await saveTwoFactorSecret(userId, secret);

  // 3. Generate the OTPAuth URL
  // The 'issuer' is your application's name, 'label' is the user's identifier
  const appName = 'ft_transcendence'; // Replace with your application's name
  const otpAuthUrl = otplib.authenticator.keyuri(username, appName, secret);
  console.log(`Generated OTPAuth URL: ${otpAuthUrl}`);

  // 4. Generate the QR code image as a data URL
  const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);
  console.log('QR Code Data URL generated.');

  return {
    secret,
    qrCodeUrl,
    otpAuthUrl
  };
}

/**
 * Verifies a TOTP token provided by the user.
 * @param {number} userId - The unique ID of the user.
 * @param {string} token - The 6-digit token entered by the user.
 * @returns {Promise<boolean>} True if the token is valid, false otherwise.
 */
async function verifyTwoFaToken(userId, token) {
  // 1. Retrieve the stored secret for the user from the database
  const secret = await getTwoFactorSecret(userId);

  if (!secret) {
    console.warn(`[2FA Verify] No 2FA secret found for user ${userId}.`);
    return false; // User has no 2FA secret set up
  }

  // 2. Verify the token using otplib
  const isValid = otplib.authenticator.verify({ token, secret });

  if (isValid) {
      // If verification is successful, you might want to mark 2FA as enabled for the user
      // This is important if you want to require 2FA for future logins
      await enableTwoFactor(userId, secret);
      console.log(`[2FA Verify] Token for user ${userId} is valid.`);
  } else {
      console.log(`[2FA Verify] Token for user ${userId} is invalid.`);
  }

  return isValid;
}

module.exports = {
  generateTwoFaSetup,
  verifyTwoFaToken
};