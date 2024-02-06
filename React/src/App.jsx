import './App.css';
import React, { useState } from 'react';

function App() {

  const [isPopupOpen, setPopupOpen] = useState(false);

  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
  };
  return (
    <>


<div className="container">
        <div className="sign-in-container">
            <button className="button button-sign-in  open-popup-btn" onClick={togglePopup}>ADD USER</button>
            {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <span className="close-popup" onClick={togglePopup}>
              &times;
            </span>
            <form>
                  <div className="form-group">
                    <label htmlFor="username">User Name:</label>
                    <input type="text" className ="text-popup" id="username" name="username" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customer-id">Customer ID:</label>
                    <input type="text" id="customer-id" className ="text-popup" name="customer-id" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" className ="text-popup"id="email" name="email" />
                  </div>
                  <button type="submit" className="button button-sign-in">Add User</button>
                </form>
          </div>
        </div>
      )}
        </div>
        <h1>USER DATA</h1>

        <table className="table-container">
            <thead>
                <tr>
                    <th>User Name</th>
                    <th>Customer ID</th>
                    <th>Email</th>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Card Link</th>
                </tr>
            </thead>
            <tbody>
           
                <tr>
                 
                    <td>John Doe</td>
                    <td><input type="text" name="customer_id_1" /></td>
                    <td>john@example.com</td>
                    <td><button className="button button-edit">Edit</button></td>
                    <td><button className="button button-delete">Delete</button></td>
                    <td className="button-container">
                        <button className="button button-openLink">Open Link</button>
                        <button className="button button-copy">Copy</button>
                    </td>

                    
                </tr>
                <tr>
                    <td>Jane Smith</td>
                    <td><input type="text" name="customer_id_1" /></td>
                    <td>jane@example.com</td>
                    <td><button className="button button-edit">Edit</button></td>
                    <td><button className="button button-delete">Delete</button></td>
                    <td className="button-container">
                        <button className="button button-openLink">Open Link</button>
                        <button className="button button-copy">Copy</button>
                    </td>
                </tr>
                
                <tr>
                    <td>Bob Johnson</td>
                    <td><input type="text" name="customer_id_1" /></td>
                    <td>bob@example.com</td>
                    <td><button className="button button-edit">Edit</button></td>
                    <td><button className="button button-delete">Delete</button></td>
                    <td className="button-container">
                        <button className="button button-openLink">Open Link</button>
                        <button className="button button-copy">Copy</button>
                    </td>
                </tr>
                <tr>
                    <td>Alice Brown</td>
                    <td><input type="text" name="customer_id_1" /></td>
                    <td>alice@example.com</td>
                    <td><button className="button button-edit">Edit</button></td>
                    <td><button className="button button-delete">Delete</button></td>
                    <td className="button-container">
                        <button className="button button-openLink">Open Link</button>
                        <button className="button button-copy">Copy</button>
                    </td>
                </tr>
               
              
              
                
            </tbody>
        </table>

    </div>

 
    </>
  );
}

export default App;
