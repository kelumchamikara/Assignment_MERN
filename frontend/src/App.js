import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Registation";
import AdminDashboard from "./Components/Dashboard/AdminDashboard";


function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
