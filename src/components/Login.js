import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Both email and password are required.', {
        closeButton: false, // Remove the close button
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email format.', {
        closeButton: false, // Remove the close button
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.', {
        closeButton: false, // Remove the close button
      });
      return;
    }

    try {
      // API call for login
      const response = await api.post('/login', { email, password });
      const token = response?.data.access_token;
      const loged_user_data = response?.data.data;
      localStorage.setItem('token', token); 
      localStorage.setItem('loged_user_data', JSON.stringify(loged_user_data)); 
      console.log('Login successful:', loged_user_data);

      toast.success('Login successful! Redirecting...', {
        closeButton: false, // Remove the close button
      });

      setTimeout(() => {
        onLoginSuccess(token); // Call function to update state and navigate
      }, 1500);
    } catch (err) {
      toast.error('Invalid email or password.', {
        closeButton: false, // Remove the close button
      });
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container" style={{backgroundImage: "url('./images/login_background.jpg')"}}>
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton={false} // Remove the close button globally
      />
    </div>
  );
};

export default Login;