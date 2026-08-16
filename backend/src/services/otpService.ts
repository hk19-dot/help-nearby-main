import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OtpToken, OtpPurpose } from '../models/OtpToken';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/** Generate a cryptographically secure 6-digit OTP */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/** Hash + store OTP in MongoDB, replacing any existing OTP for this email & purpose */
export const createAndStoreOtp = async (
  email: string,
  purpose: OtpPurpose
): Promise<string> => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Remove any existing OTP for this email + purpose
  await OtpToken.deleteMany({ email: email.toLowerCase(), purpose });

  await OtpToken.create({
    email: email.toLowerCase(),
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
  });

  return otp; // return plain OTP to send via email
};

/** Verify an OTP. Returns true if valid, throws descriptive error otherwise. */
export const verifyOtp = async (
  email: string,
  otpInput: string,
  purpose: OtpPurpose
): Promise<boolean> => {
  const record = await OtpToken.findOne({
    email: email.toLowerCase(),
    purpose,
  });

  if (!record) {
    throw new Error('OTP not found or already used. Please request a new one.');
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new Error('Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otpInput, record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
  }

  // OTP verified — delete it so it can't be reused
  await record.deleteOne();
  return true;
};
