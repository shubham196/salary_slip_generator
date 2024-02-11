import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import { Link } from "react-router-dom";
import CalendarComponent from "./CalendarComponent";

const LOCAL_IP = import.meta.env.VITE_SERVER_IP

console.log("LOCAL_IP  in HOMEPAGE",LOCAL_IP);
// Table row component
const UserTableRow = ({ user, handleInputChange, handleGenerateLink, handleDeleteUser }) => (
  <tr>
    {/* <td>{user._id}</td> */}
  
      {/* <Link to={`/show-user/${user._id}`}>{user.name}</Link> */}
      {/* <Link to={`/show-user/${user._id}?calendarLink=${encodeURIComponent(user.calendarLink || '')}`}>{user.name}</Link> */}
  
    <td>
      <img
        src={`${LOCAL_IP}/uploads/${user.image}`}
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
    <Link to={`/show-user/${user._id}?calendarLink=${encodeURIComponent(user.calendarLink || '')}`} className="button button-openLink">
      Open Link
    </Link>
</td>

  </tr>
);

function ShowUserList() {
  const [users, setUsers] = useState([]);
  const [calendarLink, setCalendarLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

    // Function to fetch user data
  const fetchUsers = () => {
    axios
      .get(`${LOCAL_IP}/api/users`)
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

  // Function to generate calendar link and store calendar link in DB
  const handleGenerateLink = (userId) => {
    const user = users.find((user) => user._id === userId);
    if (!user || !user.calendarId) {
      window.alert("Enter Calendar ID")
      console.log("Calendar ID not found for user:", userId);
      return;
    }
    
    const link = `${LOCAL_IP}/calendarFiles/calendarData_${user.calendarId}.json`;
    
    // Update the user object with the generated link
    const updatedUser = { ...user, calendarLink: link };
    
    // Update the users state with the updated user object using the callback form of setUsers
    setUsers(prevUsers => prevUsers.map(u => u._id === userId ? updatedUser : u));
    
    // Store the generated link in the database
    axios
      .put(`${LOCAL_IP}/api/users/${userId}/calendar`, { calendarId: user.calendarId, calendarLink: link })
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
        .delete(`${LOCAL_IP}/api/users/${userId}`)
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
  <div className="container mx-auto">
    <div className="list">
      <h1 className="text-2xl font-bold mb-4">USER DATA</h1>
      <Link
        to="/create-user"
        className="button button-sign-in bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mb-4"
      >
        Add New User
      </Link>
      <Link
        to={`${LOCAL_IP}/auth/calendarList`}
        className="button button-sign-in bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-10 rounded inline-block mb-4"
      >
        Calendar List
      </Link>
      <Link
        to={`${LOCAL_IP}/auth/signout`}
        className="button button-sign-in bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-10 rounded inline-block mb-4"
      >
        Sign Out
      </Link>
      <table className="table-container w-full">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th className="py-2">Image</th>
            <th className="py-2">Name</th>
            <th className="py-2">Designation</th>
            <th className="py-2">Calendar ID</th>
            <th className="py-2">Edit</th>
            <th className="py-2">Delete</th>
            <th className="py-2">Generate Link</th>
            <th className="py-2">Open Card</th>
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
      {calendarLink && (
        <p className="mt-4">Generated Calendar Link: {calendarLink}</p>
      )}
      <CalendarComponent calendarLink={calendarLink} />
    </div>
  </div>
</div>

  );
}

export default ShowUserList;
