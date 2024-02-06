import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../App.css";
import axios from "axios";

function ShowUserDetails(props) {
  const [user, setUser] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/users/${id}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log("Error from ShowUserDetails");
      });
  }, [id]);

  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/users/${id}`)
      .then((res) => {
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const UserItem = (
    <div>
      <table className="table table-hover table-dark">
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Title</td>
            <td>{user.name}</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Author</td>
            <td>{user.designation}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
      <div className="container">
        <div className="row">
          <div className="col-md-10 m-auto">
            <br /> <br />
            
            <Link to="/" className="btn btn-outline-warning float-left">
              Show User List
            </Link>
          </div>
          <br />
          <div className="col-md-8 m-auto">
            <h1 className="display-4 text-center">User's Record</h1>
            <p className="lead text-center">View User's Info</p>
            <hr /> <br />
          </div>
          <div className="col-md-10 m-auto">{UserItem}</div>
          <div className="col-md-6 m-auto">
            <button
              type="button"
              className="btn btn-outline-danger btn-lg btn-block"
              onClick={() => {
                onDeleteClick(user._id);
              }}
            >
              Delete User
            </button>
          </div>
          <div className="col-md-6 m-auto">
            <Link
              to={`/edit-user/${user._id}`}
              className="btn btn-outline-info btn-lg btn-block"
            >
              Edit User
            </Link>
          </div>
        </div>
      </div>

  );
}

export default ShowUserDetails;
