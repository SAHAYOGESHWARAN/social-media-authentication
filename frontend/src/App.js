import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';
import PasswordReset from './components/PasswordReset';


const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/otp-verification" component={OTPVerification} />
        <Route path="/password-reset" component={PasswordReset} />
      </Switch>
    </Router>
  );
};

export default App;
