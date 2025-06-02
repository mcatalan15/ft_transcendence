// /api/schemas/twoFaSchema.js

const twoFaQrResponseSchema = {
  type: 'object',
  properties: {
    secret: { type: 'string', description: 'The TOTP secret key for the user.' },
    qrCodeUrl: { type: 'string', format: 'uri', description: 'Data URL of the QR code image (e.g., data:image/png;base64,...).' },
    otpAuthUrl: { type: 'string', format: 'uri', description: 'The otpauth:// URI for manual entry or deep linking.' }
  },
  required: ['secret', 'qrCodeUrl', 'otpAuthUrl']
};

const twoFaSetupResponseSchema = {
  200: twoFaQrResponseSchema,
  400: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  },
  500: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
};

const twoFaVerifyRequestSchema = {
  type: 'object',
  properties: {
    userId: { type: 'number' }, // Or whatever your user identifier is
    token: { type: 'string', minLength: 6, maxLength: 6, pattern: '^[0-9]+$' } // 6-digit number
  },
  required: ['userId', 'token']
};

const twoFaVerifyResponseSchema = {
  200: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      verified: { type: 'boolean' }
    }
  },
  400: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
};

module.exports = {
  twoFaSetupResponseSchema,
  twoFaVerifyRequestSchema,
  twoFaVerifyResponseSchema
};