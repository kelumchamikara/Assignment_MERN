import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
  
    try {
      console.log("Starting registration attempt for username:", formData.username);
      
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      
      console.log("Registration response status:", response.status);
      
      const data = await response.json();
      console.log("Registration response data:", data);
      
      if (response.ok) {
        console.log("Registration successful");
        // Store the token from the registration response
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("Token stored in localStorage");
        } else {
          console.warn("No token received in successful registration response");
        }
        alert("Registration successful!");
        navigate("/admin-dashboard"); // Redirect to Admin Dashboard
      } else {
        console.error("Registration failed:", data.message);
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error.name, error.message);
      console.error("Error stack:", error.stack);
      setError(`Something went wrong. Please try again. ${error?.message || error}`);

    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "25rem" }} className="p-4 shadow bg-dark text-light">
        <h3 className="text-center mb-3">Register</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {error && <p className="text-danger mt-2">{error}</p>}

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Register
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Already have an account? <a href="/">Login</a>
        </p>
      </Card>
    </Container>
  );
};

export default Register;