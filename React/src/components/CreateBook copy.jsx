import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const CreateBook = (props) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const [book, setBook] = useState({
    name: "",
    designation: "",
    image: null, // Change image to null
  });

  const onChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    setBook({ ...book, image: e.target.files[0] }); // Update image state with the selected file
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3000/api/books", book, {
        headers: {
          "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
        },
      })
      .then((res) => {
        setBook({
          name: "",
          designation: "",
          image: null, // Change image to null
        });

        // Push to /
        navigate("/");
      })
      .catch((err) => {
        console.log("Error in CreateBook!");
      });
  };

  return (
    <div className="CreateBook">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show BooK List
            </Link>
          </div>
          <div className="col-md-10 m-auto">
            <h1 className="display-4 text-center">Add Book</h1>
            <p className="lead text-center">Create new book</p>

            <form noValidate onSubmit={onSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="name"
                  name="name"
                  className="form-control"
                  value={book.name}
                  onChange={onChange}
                />
              </div>
              <br />
              <div className="form-group">
                <input
                  type="text"
                  placeholder="designation"
                  name="designation"
                  className="form-control"
                  value={book.designation}
                  onChange={onChange}
                />
              </div>
              <br />
              <div className="form-group">
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={onImageChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-warning btn-block mt-4 mb-4 w-100"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
