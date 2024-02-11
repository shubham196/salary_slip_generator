import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../assets/nameplate.css";
import axios from "axios";
import CalendarComponent from "./CalendarComponent";

const LOCAL_IP = import.meta.env.VITE_SERVER_IP

console.log("LOCAL_IP  in NAMEPLATE",LOCAL_IP);

function NamePlate(props) {
  const [user, setUser] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${LOCAL_IP}/api/users/${id}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log("Error from ShowUserDetails");
      });
  }, [id]);

  const onDeleteClick = (id) => {
    axios
      .delete(`${LOCAL_IP}/api/users/${id}`)
      .then((res) => {
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

return (
    <div className="playback-view">
    <div className="logo"><img id="img1"  src={`${LOCAL_IP}/uploads/logo.png`} alt=""/></div>

        <CalendarComponent />
        <div className="model-message">{user.name}</div>
        <div className="overlay-texth2">{user.designation}</div>
        <div className="user-image">
          <img
            src={`${LOCAL_IP}/uploads/${user.image}`}
            alt=""
          />
          <div className="content" id="content"></div>
        </div>
      </div>
    );
 
}
export default NamePlate;
