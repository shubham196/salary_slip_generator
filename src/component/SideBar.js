import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SideBar() {
  const [activeLink, setActiveLink] = useState('');
  const [showSignOutForm, setShowSignOutForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleSignOutClick = () => {
    setShowSignOutForm(true);
  };

  const handleSignOutConfirm = () => {
    setShowSignOutForm(false);
  };

  const handleSignOutCancel = () => {
    setShowSignOutForm(false);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter options based on the search query
// Filter options based on the search query
const filteredOptions = [
  { to: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { to: '/user', label: 'User', icon: 'fas fa-user' },
  { to: '/list', label: 'Calendar List', icon: 'far fa-calendar-alt' },
  { to: '/signup', label: 'Sign Up', icon: 'fas fa-user-plus' },
  { to: '/card', label: 'Card Design', icon: 'far fa-credit-card' } ,
  { to: '/error', label: 'Error', icon: 'fa-solid fa-bug' } // Added card design option
].filter(option =>
  option.label.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <div className="sidebar">
      <div className="logo">
        <img src="./assets/images/logo.png" alt="Logo" className="logo-img" />
        <hr className='horizon-line' />
        <div className="search-container-sidebar">
          <i className="fas fa-search search-icon-sidebar"></i>
          <input
            type="text"
            placeholder="Search..."
            className="search-input-sidebar"
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="options">
  <h1>CATEGORIES</h1>
  {filteredOptions.map((option, index) => (
    <div className="option" key={index}>
      <Link
        to={option.to}
        onClick={() => handleLinkClick(option.label)}
        className={activeLink === option.label ? 'active-link' : ''}
      >
        {option.icon && (
          <i className={`${option.icon} icon`} style={{ color: activeLink === option.label ? 'black' : 'blue' }}></i>
        )}
        <span style={{ color: activeLink === option.label ? 'black' : 'blue' }}>{option.label}</span>
      </Link>
    </div>
  ))}
</div>

      <div className="sign-out">
        <button onClick={handleSignOutClick}><i className="fas fa-sign-out-alt"></i> Sign Out</button>
      </div>
      {showSignOutForm && (
        <div className="sign-out-overlay">
          <div className="sign-out-form">
            <h2>Confirm Sign Out</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="button-container">
              <button className="button button-yes" onClick={handleSignOutConfirm}>Yes</button>
              <button className="button button-no" onClick={handleSignOutCancel}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
