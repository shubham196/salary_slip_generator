// Error.js

import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
  return (
    <div className="error-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link to="/">Go to Home Page</Link>
    </div>
  );
}

export default Error;
