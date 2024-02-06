import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../assets/nameplate.css";
import axios from "axios";
import CalendarComponent from "./CalendarComponent";

function NamePlate(props) {
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

return (
    <div className="playback-view">
    <div className="logo"><img id="img1"  src={`http://localhost:3000/uploads/logo.png`} alt=""/></div>

        <CalendarComponent />
        <div className="model-message">{user.name}</div>
        <div className="overlay-texth2">{user.designation}</div>
        <div className="user-image">
          <img
            src={`http://localhost:3000/uploads/${user.image}`}
            alt=""
          />
          <div className="content" id="content"></div>
        </div>
      </div>
    );
 
}
export default NamePlate;
