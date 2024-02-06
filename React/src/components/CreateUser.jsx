import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateUser = (props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    designation: "",
    image: null,
  });

  const [nameError, setNameError] = useState("");
  const [designationError, setDesignationError] = useState("");
  const [imageError, setImageError] = useState("");

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
        .post("http://localhost:3000/api/users", user, {
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
    <div className="container mx-auto">
  
      <div className="max-w-md mx-auto">
   
        <div className="bg-white shadow-md rounded ml-12 px-8 pt-12 pb-2 mb-4">
        <h1 className="text-3xl font-bold text-center">Add User</h1>
        
          <form noValidate onSubmit={onSubmit}>
            <div className="mb-5 w-15" >
              <input
                type="text"
                placeholder="Name"
                name="name"
                className="form-input"
                value={user.name}
                onChange={onChange}
                required
              />
              {nameError && <div className="text-red-500">{nameError}</div>}
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Designation"
                name="designation"
                className="form-input"
                value={user.designation}
                onChange={onChange}
                required
              />
              {designationError && (
                <div className="text-red-500">{designationError}</div>
              )}
            </div>
            <div className="mb-1">
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={onImageChange}
                required
              />
              {imageError && <div className="text-red-500">{imageError}</div>}
            </div>
            <button
              type="submit"
              className="btn btn-outline-warning btn-block mt-4 mb-4 w-full"
            >
              Submit
            </button>
            <div className="btn btn-outline-warning btn-block mt-1 mb-4 w-full">
                <Link to="/" className="">
                  Back
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
