import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/otp-verification" component={OTPVerification} />
      </Switch>
    </Router>
  );
};

export default App;
