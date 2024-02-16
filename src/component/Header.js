import React from 'react'
import { BrowserRouter, Routes,  Route , Link} from 'react-router-dom';
import SignUp from './SignUp';

export default function Header() {
  return (
    <div className='top-header'>
    
    <div className='search-container'>
      <i className='fas fa-search search-icon'></i>
      <input type='text'  placeholder='Search...' className='search-input' />
    </div>
    <div className='user-info'>
      <img src="./assets/images/user.jpg" alt='User' className='user-image' />
      <span className='user-name'>John Doe</span>
    
    </div>

   
  </div>
  )
}
