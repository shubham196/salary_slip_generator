import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateUserInfo(props) {
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

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/users/${id}`)
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
  }, [id]);

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
      console.log("Bhai image nahi aa raha hai");
      setImageError("Image is required");
    }
    if (user.name && user.designation && user.image){
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("designation", user.designation);
    formData.append("image", user.image); // Make sure user.image contains the file object
    
    axios
      .put(`http://localhost:3000/api/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        window.alert("User Updated Successfully!")
        navigate(`/`);
      })
      .catch((err) => {
        console.log("Error in UpdateUserInfo!", err);
      });
  }
  
  };
  return (
    
    <div className="container mx-auto">
  
      <div className="max-w-md mx-auto">
   
        <div className="bg-white shadow-md rounded ml-12 px-8 pt-12 pb-2 mb-4">
        <h1 className="text-3xl font-bold text-center">Update User</h1>

          <form noValidate onSubmit={onSubmit}>
            <div className="mb-2 w-15">
              <input
                type="text"
                placeholder="User Name"
                name="name"
                className="form-control"
                value={user.name}
                onChange={onChange}
                required
              />
                {nameError && <div className="text-red-500">{nameError}</div>}
            </div>
            <br />

            <div className="mb-4">
              {/* <label htmlFor="designation">Designation</label> */}
              <input
                type="text"
                placeholder="Designation"
                name="designation"
                className="form-control"
                value={user.designation}
                onChange={onChange}
                required
              />
                {designationError && (
                <div className="text-red-500">{designationError}</div>
              )}
            </div>
            <br />

            <div className="mb-1">
              {/* <label htmlFor="image">Image</label> */}
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={onImageChange}
                required
              />
                {imageError && <div className="text-red-500">{imageError}</div>}
            </div>
            <br />

            <button
              type="submit"
              className="btn btn-outline-warning btn-block mt-4 mb-4 w-full"
            >
              Update User
            </button>
            <div className="btn btn-outline-warning btn-block mt-1 mb-4 w-full">
                <Link to="/" className="button">
                  Back
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default UpdateUserInfo;
