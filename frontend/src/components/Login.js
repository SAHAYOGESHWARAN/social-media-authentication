import React, { useState } from 'react';
import { login } from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ phoneNumber: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      alert('Login successful!');
    } catch (error) {
      console.error(error.response.data);
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
