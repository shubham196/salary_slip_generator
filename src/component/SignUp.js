import React from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {
  return (
    <div className='main-container'>
      <div className='signup-container'>
        <div className='signup-content'>
          <h2>Welcome to Sign Up!</h2>
          <button className='signup-button'>Sign Up</button>
        </div>
      </div>
      <div className='image-container'>
        <div className='image-text'>
            <h2> Welcome To The DIGINAGE </h2>
            <p> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eum sequi inventore odio? Quis perferendis iure tenetur ipsum beatae consequuntur fuga?</p></div>
            <h1 className='bottomtext'> " DIGINAGE WAY TO SUCCESS ADD MORE TEXT ! "</h1>
        <img src="./assets/images/back_3.jpg" alt='Sign Up' className='signup-image' />
      </div>
      <div className='top-button'>
        <Link to="/">
          <button className='back-button'>
            <i className='fas fa-arrow-left'></i> Back
          </button>
        </Link>
      </div>
    </div>
  );
}
