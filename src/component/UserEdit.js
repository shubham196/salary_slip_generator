import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UserEdit(props) {
  const [user, setUser] = useState({
    name: "",
    designation: "",
    image: null,
  });

  const [nameError, setNameError] = useState("");
  const [designationError, setDesignationError] = useState("");
  const [imageError, setImageError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
//   console.log("UserIs is here",props.userId);
  const LOCAL_IP = process.env.REACT_APP_IP;

  console.log("ID",props.userId); 
  console.log("UserIs is here ID",props.userId);
  useEffect(() => {
    console.log("User",props.userId);
    if (props.isOpen) {
        console.log("Open hai",props.userId);
      axios
        .get(`${LOCAL_IP}/api/users/${props.userId}`)
        .then((res) => {
          setUser({
            name: res.data.name,
            designation: res.data.designation,
            // image: res.data.image, // Set the image state
          });
        })
        .catch((err) => {
          console.log("Error from UpdateUserInfo");
        });
    }
  }, [props.userId]);

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (e.target.name === "name") setNameError("");
    if (e.target.name === "designation") setDesignationError("");
  };

  const onImageChange = (e) => {
    setUser({ ...user, image: e.target.files[0] });
    setImageError("");
  };
//   const togglePopup = () => {
//     setPopupOpen(!isPopupOpen);
//   };

  const handleClose = () => {
    window.location.reload() // Call the onClose function passed as props
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
      console.log("Bhai image nahi aa raha hai");
      setImageError("Image is required");
    }
    if (user.name && user.designation && user.image){
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("designation", user.designation);
    formData.append("image", user.image); // Make sure user.image contains the file object
    
    axios
      .put(`${LOCAL_IP}/api/users/${props.userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        window.alert("User Updated Successfully!")
        window.location.reload(); 
      })
      .catch((err) => {
        console.log("Error in UpdateUserInfo!", err);
      });
  }
  
  };
  return (
    // <div className={`popup-overlay ${props.isOpen ? "open" : ""}`}>
    <div className={`popup-overlay ${props.isOpen ? "open" : ""}`}>
    <div className="popup-content">
        <span className="close-popup" onClick={props.onClose}>
    &times;
    </span>
      <form noValidate onSubmit={onSubmit}>
        <div className="form">
          <div className="title">Welcome</div>
          <div className="subtitle">Update User Details!</div>
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
           Update User
          </button>
          <button type="button" className="close-popup" onClick={handleClose}>
           X
          </button>
        </div>
      </form>
    </div>
  </div>

  );
}
export default UserEdit;
