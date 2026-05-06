# Forgot Password Setup Guide

## Overview
The forgot password functionality allows both patients and labs to reset their passwords using OTP (One-Time Password) sent to their email.

## Features
- 6-digit OTP sent to user's email
- OTP expires in 5 minutes
- Works for both patients and laboratories
- Secure password hashing with bcrypt
- Email sent via Gmail SMTP (free and fast)

## Setup Instructions

### 1. Gmail Configuration
To send emails, you need to configure Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Update Environment Variables**:
   - Open `server/.env`
   - Replace `your-gmail@gmail.com` with your Gmail address
   - Replace `your-gmail-app-password` with the app password you generated

### 2. Test the Setup
1. Start the server: `npm run dev`
2. Go to login page and click "Forgot Password"
3. Enter your email and role (patient/lab)
4. Check your email for the OTP
5. Use the OTP to reset your password

## Security Notes
- OTPs are stored in memory and expire after 5 minutes
- Passwords are hashed using bcrypt with 10 salt rounds
- In production, consider using Redis for OTP storage instead of in-memory
- Consider rate limiting password reset requests

## API Endpoints
- `POST /api/auth/password-reset-request` - Request OTP
- `POST /api/auth/password-reset` - Reset password with OTP

## Frontend Pages
- `/forgot-password` - Request OTP page
- `/reset-password` - Reset password page