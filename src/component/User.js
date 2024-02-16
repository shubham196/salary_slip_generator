import React, { useState } from 'react';
import { data } from './data';

export default function User() {
  const [search, setSearch] = useState('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = data.slice(firstIndex, lastIndex);
  const npage = Math.ceil(data.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
  };

  const toggleEditPopup = () => {
    setEditPopupOpen(!isEditPopupOpen);
  };

  const toggleDeleteConfirmation = () => {
    setDeleteConfirmationOpen(!isDeleteConfirmationOpen);
  };

  const handleDelete = () => {
    // Handle delete logic here
    toggleDeleteConfirmation(); // Close delete confirmation popup after deletion
  };

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < npage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const changeCPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="container">
        <div className="sign-in-container">
          <button className="button button-sign-in open-popup-btn" onClick={togglePopup}>
            ADD USER
          </button>
          {isPopupOpen && (
            <div className="popup-overlay">
              <div className="popup-content">
                <span className="close-popup" onClick={togglePopup}>
                  &times;
                </span>
                <form>
                  <div className="form">
                    <div className="title">Welcome</div>
                    <div className="subtitle">Add User Details!</div>
                    <div className="input-container ic1">
                      <input id="firstname" className="input" type="text" placeholder=" " />
                      <div className="cut"></div>
                      <label htmlFor="firstname" className="placeholder">
                        User name
                      </label>
                    </div>
                    <div className="input-container ic2">
                      <input id="lastname" className="input" type="text" placeholder=" " />
                      <div className="cut"></div>
                      <label htmlFor="lastname" className="placeholder">
                        Customer Id
                      </label>
                    </div>
                    <div className="input-container ic2">
                      <input id="email" className="input" type="text" placeholder=" " />
                      <div className="cut cut-short"></div>
                      <label htmlFor="email" className="placeholder">
                        Email
                      </label>
                    </div>
                    <button type="text" className="submit">
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        <div className="search-container-user">
          <i className="fas fa-search search-icon-user"></i>
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search By Name ..."
            className="search-input-user"
          />
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
            {records
              .filter((item) => {
                return search.toLowerCase() === '' ? item : item.name.toLowerCase().includes(search);
              })
              .map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <input type="text" className="custom-id-input-text" name="customer_id_1" />
                  </td>
                  <td>{item.email}</td>
                  <td>
                    <button className="button button-edit" onClick={toggleEditPopup}>
                      Edit
                    </button>
                    {isEditPopupOpen && (
                      <div className="edit-popup-overlay">
                        <div className="edit2-popup-overlay">
                          <div className="popup-content">
                            <span className="close-popup" onClick={toggleEditPopup}>
                              &times;
                            </span>
                            <form>
                              <div className="form">
                                <div className="title">Welcome</div>
                                <div className="subtitle">Edit User Details !</div>
                                <div className="input-container ic1">
                                  <input id="firstname" className="input" type="text" placeholder=" " />
                                  <div className="cut"></div>
                                  <label htmlFor="firstname" className="placeholder">
                                    User Name
                                  </label>
                                </div>
                                <div className="input-container ic2">
                                  <input id="lastname" className="input" type="text" placeholder=" " />
                                  <div className="cut"></div>
                                  <label htmlFor="lastname" className="placeholder">
                                    Customer Id
                                  </label>
                                </div>
                                <div className="input-container ic2">
                                  <input id="email" className="input" type="text" placeholder=" " />
                                  <div className="cut cut-short"></div>
                                  <label htmlFor="email" className="placeholder">
                                    Email
                                  </label>
                                </div>
                                <button type="text" className="submit">
                                  Edit User
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <button className="button button-delete" onClick={toggleDeleteConfirmation}>
                      Delete
                    </button>
                    {isDeleteConfirmationOpen && (
                      <div className="delete-overlay">
                        <div className="delete-confirmation">
                          <p>Are you sure you want to delete?</p>
                          <div className="button-container">
                            <button className="button button-yes" onClick={handleDelete}>
                              Yes
                            </button>
                            <button className="button button-no" onClick={toggleDeleteConfirmation}>
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="button-container">
                    <button className="button button-openLink">Open Link</button>
                    <button className="button button-copy">Copy</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className='pagination-container'>
        <nav>
          <ul className="pagination">
            <li className="page-item">
              <a href="#" className="page-link" onClick={prePage}>
                Previous
              </a>
            </li>
            {numbers.map((n, i) => (
              <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                <a href="#" className="page-link" onClick={() => changeCPage(n)}>
                  {n}
                </a>
              </li>
            ))}
            <li className="page-item">
              <a href="#" className="page-link" onClick={nextPage}>
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>

      </div>
    </>
  );
// function changeCPage (){

// }

//   function nextPage () {
    
//   }
//   function prePage () {

//   }
}
