import React, { useState, useEffect } from "react";
import { data } from './data';
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CalendarComponent from "./CalendarComponent";

export default function User() {
  const [search, setSearch] = useState('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  
  const npage = Math.ceil(data.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);
  const navigate = useNavigate();
  const [nameError, setNameError] = useState("");
  const [designationError, setDesignationError] = useState("");
  const [imageError, setImageError] = useState("");
  const [users, setUsers] = useState([]);
  const records = users.slice(firstIndex, lastIndex);
  const [user, setUser] = useState({
    name: "",
    designation: "",
    image: null,
  });
  const [calendarLink, setCalendarLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch user data
  const fetchUsers = () => {
    axios
      .get("http://localhost:8082/api/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
      });
  };
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Function to handle input change
  const handleInputChange = (e, userId) => {
    const { name, value } = e.target;
    const updatedUsers = users.map((user) =>
      user._id === userId ? { ...user, [name]: value } : user
    );
    setUsers(updatedUsers);
  };
  const updateRecords = () => {
    const records = data.slice(firstIndex, lastIndex);
    setUsers(records); // Update 'users' state with sliced data
  };
  // Function to generate calendar link and store calendar link in DB
  const handleGenerateLink = (userId) => {
    const user = users.find((user) => user._id === userId);
    if (!user || !user.calendarId) {
      window.alert("Enter Calendar ID")
      console.log("Calendar ID not found for user:", userId);
      return;
    }
    
    const link = `http://localhost:8082/calendarFiles/calendarData_${user.calendarId}.json`;
    
    // Update the user object with the generated link
    const updatedUser = { ...user, calendarLink: link };
    
    // Update the users state with the updated user object using the callback form of setUsers
    setUsers(prevUsers => prevUsers.map(u => u._id === userId ? updatedUser : u));
    
    // Store the generated link in the database
    axios
      .put(`http://localhost:8082/api/users/${userId}/calendar`, { calendarId: user.calendarId, calendarLink: link })
      .then((res) => {
        window.alert("Calendar Link Generated")
        console.log("Calendar link stored successfully:", res.data);
      })
      .catch((err) => {
        window.alert("Error storing calendar link")
        console.log("Error storing calendar link:", err);
      });
  };
  
  // Function to delete a user
  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`http://localhost:8082/api/users/${userId}`)
        .then((res) => {
          console.log("User deleted successfully");
          // Update the users state to reflect the deletion
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        })
        .catch((err) => {
          console.log("Error deleting user:", err);
        });
    }
  };

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

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (e.target.name === "name") setNameError("");
    if (e.target.name === "designation") setDesignationError("");
  };

  const onImageChange = (e) => {
    setUser({ ...user, image: e.target.files[0] });
    setImageError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!user.name) {
      setNameError("Name is required");
    }
    if (!user.designation) {
      setDesignationError("Designation is required");
    }
    if (!user.image) {
      setImageError("Image is required");
    }
    if (user.name && user.designation && user.image) {
      axios
        .post("http://localhost:8082/api/users", user, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setUser({
            name: "",
            designation: "",
            image: null,
          });
          window.alert("User Created Successfully!");
          navigate("/");
        })
        .catch((err) => {
          console.log("Error in CreateUser!");
        });
    }
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
                <form noValidate onSubmit={onSubmit}>
                  <div className="form">
                    <div className="title">Welcome</div>
                    <div className="subtitle">Add User Details!</div>
                    <div className="input-container ic1">
                    <input
                        type="text"
                        placeholder="Name"
                        name="name"
                        className="input"
                        value={user.name}
                        onChange={onChange}
                        required
                    />
                      <div className="cut"></div>
                      <label htmlFor="firstname" className="placeholder">
                       
                      </label>
                    </div>
                    <div className="input-container ic2">
                    <input
                      type="text"
                      placeholder="Designation"
                      name="designation"
                      className="input"
                      value={user.designation}
                      onChange={onChange}
                      required
                   />
                      <div className="cut"></div>
                      <label htmlFor="lastname" className="placeholder">
                       
                      </label>
                    </div>
                    <div className="input-container ic2">
                    <input
                      type="file"
                      accept="image/*"
                      className="input"
                      name="image"
                      onChange={onImageChange}
                      required
                    />
                      <div className="cut cut-short"></div>
                      <label htmlFor="email" className="placeholder">
                        Upload Image
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
            <th>Image</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Calendar ID</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Generate Link</th>
            <th>Open Card</th>
            </tr>
          </thead>
          <tbody>
            {records
              .filter((user) => {
                return search.toLowerCase() === '' ? user : user.name.toLowerCase().includes(search);
              })
              .map((user) => (
                <tr key={user.id}>
                      <td>
                        <img
                          src={`http://localhost:8082/uploads/${user.image}`}
                          alt="image"
                          height={50}
                          width={50}
                        />
                      </td>
                  <td>
                      {user.name}
                  </td>
                  <td>{user.designation}</td>
                  <td>
                    <input
                      type="text"
                      className="custom-id-input-text"
                      name="calendarId"
                      value={user.calendarId || ""}
                      onChange={(e) => handleInputChange(e, user._id)}
                    />
                  </td>
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
                  <td>
                    <button className="button button-delete" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </td>
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
                    <button className="button button-openLink" onClick={() => handleGenerateLink(user._id)}>Generate</button>
          
                  </td>
                  <td>             
                    <Link to={`/show-user/${user._id}?calendarLink=${encodeURIComponent(user.calendarLink || '')}`} className="button button-copy">
                        Open Link
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className='pagination-container'>
        <nav>
          <ul className="pagination">
            <li className="page-user">
              <a href="#" className="page-link" onClick={prePage}>
                Previous
              </a>
            </li>
            {numbers.map((n, i) => (
              <li className={`page-user ${currentPage === n ? 'active' : ''}`} key={i}>
                <a href="#" className="page-link" onClick={() => changeCPage(n)}>
                  {n}
                </a>
              </li>
            ))}
            <li className="page-user">
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

}
