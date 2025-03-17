import React, { useState, useEffect } from "react";
import { Container, Table, Button, Navbar, Nav, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ _id: "", name: "", image: "", age: "", status: "Active" });
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        navigate("/");
        return;
      }
      
      const response = await fetch("http://localhost:5000/api/students", {
        headers: {
          "x-auth-token": token,
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      
      const data = await response.json();
      console.log("Fetched students:", data);
      
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("Expected array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleShowModal = (student = null) => {
    if (student) {
      setEditMode(true);
      setFormData(student);
    } else {
      setEditMode(false);
      setFormData({ _id: "", name: "", image: "", age: "", status: "Active" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setImageFile(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found in localStorage");
            throw new Error("Unauthorized: No token provided");
        }

        const url = editMode ? `http://localhost:5000/api/students/${formData._id}` : "http://localhost:5000/api/students";
        const method = editMode ? "PUT" : "POST";
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("age", formData.age);
        formDataToSend.append("status", formData.status);
        if (imageFile) {
            formDataToSend.append("image", imageFile);
        }

        const response = await fetch(url, {
            method,
            body: formDataToSend,
            headers: {
                "x-auth-token": token,
                "Authorization": `Bearer ${token}`
            }
        });

        const responseData = await response.json();
        console.log("API Response:", responseData);

        if (!response.ok) {
            console.error("Error response:", responseData);
            throw new Error("Failed to save student");
        }

        fetchStudents();
        setShowModal(false);
    } catch (error) {
        console.error("Error saving student:", error);
    }
};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          navigate("/");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/students/${id}`, {
          method: "DELETE",
          headers: {
            "x-auth-token": token,
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error("Failed to delete student");
        }

        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Admin Dashboard</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Button variant="success" className="mb-3" onClick={() => handleShowModal()}>Add New Student</Button>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th>Age</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student._id}</td>
                  <td>{student.name}</td>
                  <td>
                  <img 
                      src={`http://localhost:5000${student.image}`} 
                      alt={student.name} 
                      style={{ width: "100px", height: "100px", borderRadius: "25px" }} 
                  />
                  </td>
                  <td>{student.age}</td>
                  <td>{student.status}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowModal(student)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(student._id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No students found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>

      {/* Modal for Adding/Editing Student */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Student" : "Add New Student"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" name="image" onChange={handleFileChange} required={!editMode} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control type="number" name="age" value={formData.age} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              {editMode ? "Update" : "Add"} Student
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminDashboard;