import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Bootstrap CSS & JS imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

// Components imports
import CreateUser from "./components/CreateUser";
import ShowUserList from "./components/ShowUserList";
import ShowUserDetails from "./components/ShowUserDetails";
import UpdateUserInfo from "./components/UpdateUserInfo";
import UserCard from "./components/UserCard";
import NamePlate from "./components/NamePlate";
// Routes
const router = createBrowserRouter([
  { path: "/", element: <ShowUserList /> },
  // { path: "/nameplate", element: <NamePlate /> },
  { path: "/users", element: <UserCard /> },
  { path: "/create-user", element: <CreateUser /> },
  // { path: "/show-user/:id", element: <ShowUserDetails /> },
  { path: "/show-user/:id", element: <NamePlate /> },
  { path: "/edit-user/:id", element: <UpdateUserInfo /> },
  // { path: "/delete/:id", element: <ShowUserList /> },
 
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
