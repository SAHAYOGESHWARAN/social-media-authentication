import React, { useState } from 'react';
import axios from 'axios';

const OTPVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [message, setMessage] = useState('');

  // Handle sending OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/twilio/2fa/send', { phoneNumber });
      setMessage(response.data.message);
      setIsOTPSent(true);
    } catch (error) {
      setMessage('Error sending OTP. Please try again.');
    }
  };

  // Handle verifying OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/twilio/2fa/verify', { phoneNumber, otp });
      setMessage('OTP Verified. You are now authenticated!');
    } catch (error) {
      setMessage('Invalid or expired OTP.');
    }
  };

  return (
    <div className="otp-verification">
      <h2>OTP Verification</h2>
      {!isOTPSent ? (
        <form onSubmit={sendOTP}>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button type="submit">Send OTP</button>
        </form>
      ) : (
        
        <form onSubmit={verifyOTP}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default OTPVerification;
