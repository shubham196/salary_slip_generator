import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import { Link } from "react-router-dom";
import CalendarComponent from "./CalendarComponent";

// Table row component
const UserTableRow = ({ user, handleInputChange, handleGenerateLink, handleDeleteUser }) => (
  <tr>
    {/* <td>{user._id}</td> */}
  
      {/* <Link to={`/show-user/${user._id}`}>{user.name}</Link> */}
      {/* <Link to={`/show-user/${user._id}?calendarLink=${encodeURIComponent(user.calendarLink || '')}`}>{user.name}</Link> */}
  
    <td>
      <img
        src={`http://localhost:8082/uploads/${user.image}`}
        alt="image"
        height={50}
        width={50}
      />
    </td>
    <td>{user.name}</td>
    <td>{user.designation}</td>
    <td>
      <input
        type="text"
        name="calendarId"
        value={user.calendarId || ""}
        onChange={(e) => handleInputChange(e, user._id)}
      />
    </td>
    <td>
    <Link to={`/edit-user/${user._id}`} className="button button-edit">
       Edit
      </Link>
    </td>
    <td>
      <button className="button button-delete" onClick={() => handleDeleteUser(user._id)}>Delete</button>
    </td>
    <td className="button-container">
      <button
        className="button button-generateLink"
        onClick={() => handleGenerateLink(user._id)}
      >

        Generate Link
      </button>
    </td>
 
<td>
  <button className="button button-openLink">
    <Link to={`/show-user/${user._id}?calendarLink=${encodeURIComponent(user.calendarLink || '')}`}>
      Open Link
    </Link>
  </button>
</td>

  </tr>
);

function ShowUserList() {
  const [users, setUsers] = useState([]);
  const [calendarLink, setCalendarLink] = useState("");
  
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

  // Function to handle input change
  const handleInputChange = (e, userId) => {
    const { name, value } = e.target;
    const updatedUsers = users.map((user) =>
      user._id === userId ? { ...user, [name]: value } : user
    );
    setUsers(updatedUsers);
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

  return (
    <div className="ShowUserList">
      <div className="container">
        <div className="list">
          <h1>USER DATA</h1>
          <Link
            to="/create-user"
            className="button button-sign-in  open-popup-btn"
          >
            + Add New User
          </Link>
          <table className="table-container">
            <thead>
              <tr>
                {/* <th>ID</th> */}
               
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
              {users.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  handleInputChange={handleInputChange}
                  handleGenerateLink={handleGenerateLink}
                  handleDeleteUser={handleDeleteUser}
                />
              ))}
            </tbody>
          </table>
          {calendarLink && <p>Generated Calendar Link: {calendarLink}</p>}
          <CalendarComponent calendarLink={calendarLink} /> 
        </div>
      </div>
    </div>
  );
}

export default ShowUserList;
