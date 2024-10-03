import React, { useState } from 'react';
import axios from 'axios';

const PasswordReset = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isTokenSent, setIsTokenSent] = useState(false);

  // Request for a reset token
  const requestResetToken = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/twilio/reset-password/request', { phoneNumber });
      setMessage(response.data.message);
      setIsTokenSent(true);
    } catch (error) {
      setMessage('Error sending reset token.');
    }
  };

  // Handle password reset
  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/twilio/reset-password', { token, newPassword });
      setMessage('Password reset successful.');
    } catch (error) {
      setMessage('Error resetting password. Invalid token or expired.');
    }
  };

  return (
    <div className="password-reset">
      <h2>Password Reset</h2>
      {!isTokenSent ? (
        <form onSubmit={requestResetToken}>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button type="submit">Request Reset Token</button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          <input
            type="text"
            placeholder="Enter reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default PasswordReset;
