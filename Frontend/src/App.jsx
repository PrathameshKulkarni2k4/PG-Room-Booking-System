import React from 'react';
import { Route, Routes } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import OwnerSignup from './pages/ownerSignup';

import AvailableRooms from './pages/AvailableRooms';
import RoomDetails from './pages/RoomDetails';
import UserProfile from './pages/UserProfile';
import OwnerProfile from './pages/OwnerProfile';
import AddRoom from './pages/AddRoom';
import EditRoom from './pages/EditRoom';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';


import PrivateRoute from './pages/PrivateRoute';
import Signup from './pages/Signup';

const App = () => {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/user-register" element={<Signup/>} />
        <Route path="/owner-login" element={<OwnerLogin/>} />
        <Route path="/owner-register" element={<OwnerSignup/>} />

        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* 🔒 Protected Route for Available Rooms */}
        <Route path="/rooms" element={
          <PrivateRoute>
            <AvailableRooms />
          </PrivateRoute>
        } />
        
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/owner" element={<OwnerProfile />} />
        <Route path="/add-room" element={<AddRoom />} />
        <Route path="/edit-room/:roomId" element={<EditRoom/>}/>
{/* //change for sending on github -- adding to main branch*/}
      </Routes>
      <Footer/>
    </div>
  );
};

export default App;
