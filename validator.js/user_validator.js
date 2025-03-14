const { z } = require('zod');

/**
 * Validator object for authentication related operations.
 * @type {Object}
 */
const userValidator = {
  register: z.object({
    name: z.string({ required_error: "Name is required to register" }).trim()
      .min(3, 'First name should be at least 3 characters long')
      .max(50, 'First name should be at most 50 characters long'),
    email: z.string({ required_error: "Email is required to register" }).trim()
      .email("Invalid email address")
      .min(5, 'Email should be at least 5 characters long')
      .max(50, 'Email should be at most 50 characters long'),
    password: z.string({ required_error: "Password is required to register" }).trim()
      .min(8, 'Password should be at least 8 characters long')
      .max(50, 'Password should be at most 50 characters long'),
    cpassword: z.string({ required_error: "Password is required to register" }).trim()
  }),

  login: z.object({
    email: z.string({ required_error: "Email is required to login" }).email("Invalid email address").trim(),
    password: z.string({ required_error: "Password is required to login" }).trim()
  }),

  verifyEmail: z.object({
    email: z.string().email("Invalid email address").trim(),
  }),

  resetPassword: z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string({ required_error: "Password is required to reset" }).trim()
      .min(8, 'Password should be at least 8 characters long')
      .max(50, 'Password should be at most 50 characters long'),
    cpassword: z.string({ required_error: "Confirm password is required to reset" }).trim()
      .min(8, 'Password should be at least 8 characters long')
      .max(50, 'Password should be at most 50 characters long'),
  })
}

module.exports = userValidator;