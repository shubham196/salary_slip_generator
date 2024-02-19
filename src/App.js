import "./App.css";
import SideBar from "./component/SideBar";
import Header from "./component/Header";
import User from "./component/User";
import UserEdit from "./component/User";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./component/Dashboard";
import CalenderList from "./component/CalenderList";
import SignUp from "./component/SignUp";
import CardDesign from "./component/CardDesign";
import Error from "./component/Error";
import NamePlate from "./component/NamePlate";

function App() {
  // console.log(data);
  return (
    <div className="container-main">
      <BrowserRouter>
        <Header />
        <SideBar />
        <Routes>
          <Route path="/user" element={<User />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/list" element={<CalenderList />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/card" element={<CardDesign />} />
          <Route path= "/show-user/:id" element={ <NamePlate />} /> 
          <Route path="/edit-user/:id" element={ <UserEdit/>} />
          <Route path="/error" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
