import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const API_URL = "http://localhost:8590";
const EMPLOYEE_API =
  "https://back-81-guards.casknet.dev/v1/81guards/employees/get-all";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState(null);

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    employee_numbers: [],
  }); 

  const [errors, setErrors] = useState({});
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  useEffect(() => {
    fetchClients();
    fetchEmployees();
  }, []);

  // Add these states at the top:
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

  // Calculate paginated data
  const totalPages = Math.ceil(clients.length / rowsPerPage);
  const paginatedClients = clients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/get`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(EMPLOYEE_API);
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let formErrors = {};
    if (!clientData.name) formErrors.name = "Name is required";
    if (!clientData.email) formErrors.email = "Email is required";
    if (!clientData.phone) formErrors.phone = "Phone number is required";
    if (!clientData.address) formErrors.address = "Address is required";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const endpoint = editingClient
      ? `${API_URL}/update?id=${editingClient.id}` // Update client endpoint
      : `${API_URL}/add`; // Add new client endpoint
    const method = editingClient ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      const result = await response.json();

      if (response.ok) {
        setPopupMessage(
          editingClient
            ? "✅ Client updated successfully!"
            : "✅ Client added successfully!"
        );
        setPopupType("success");
        setShowPopupMessage(true);

        fetchClients(); // Refresh client list
        setShowModal(false); // Close modal
        setEditingClient(null);

        setTimeout(() => setShowPopupMessage(false), 3000);
        setClientData({
          name: "",
          email: "",
          phone: "",
          address: "",
          employee_numbers: [],
        });
      } else {
        setPopupMessage(result.message || "❌ Failed to process request");
        setPopupType("error");
        setShowPopupMessage(true);
        setTimeout(() => setShowPopupMessage(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting client data:", error);
      setPopupMessage("❌ Error submitting client data.");
      setPopupType("error");
      setShowPopupMessage(true);
      setTimeout(() => setShowPopupMessage(false), 3000);
    }
  };
  const handleDeleteClient = async () => {
    try {
      const response = await fetch(`${API_URL}/delete/${deleteClientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPopupMessage("✅ Client deleted successfully!");
        setPopupType("success");
        fetchClients(); // Refresh client list
      } else {
        setPopupMessage("❌ Failed to delete client.");
        setPopupType("error");
      }
    } catch (error) {
      setPopupMessage("❌ Error deleting client.");
      setPopupType("error");
    }

    setShowPopupMessage(true);
    setShowDeletePopup(false);
  };

  const openDeletePopup = (clientId) => {
    setDeleteClientId(clientId);
    setShowDeletePopup(true);
  };

  const openEditPopup = async (client) => {
    try {
      const response = await fetch(
        `${API_URL}/getClientsbyid?client_id=${client.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch client details");

      const data = await response.json();

      // Ensure assigned employees are pre-selected
      setClientData({
        name: data.client.name,
        email: data.client.email,
        phone: data.client.phone,
        address: data.client.address,
        employee_numbers: data.client.employees.map((emp) => emp.employee_no), // Extract assigned employees
      });

      setEditingClient(client);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  return (
    <div className="w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FaPlus /> Add Client
        </button>
      </div>

      {/* Client Table */}
      {/* Client Table */}
      <table className="w-full border-collapse bg-white text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedClients.length > 0 ? (
            paginatedClients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-4 py-2">{client.id}</td>
                <td className="px-4 py-2">{client.name}</td>
                <td className="px-4 py-2">{client.email}</td>
                <td className="px-4 py-2">{client.phone}</td>
                <td className="px-4 py-2">{client.address}</td>
                <td className="px-4 py-2 flex gap-3">
                  <FaEdit
                    className="cursor-pointer text-blue-500"
                    onClick={() => openEditPopup(client)}
                  />
                  <FaTrash
                    className="cursor-pointer text-red-500"
                    onClick={() => openDeletePopup(client.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No clients found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {clients.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
            {Math.min(currentPage * rowsPerPage, clients.length)} of{" "}
            {clients.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1 ? "bg-yellow-300" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>

            {/* Rows Per Page */}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              className="ml-2 border p-1 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            {/* Show All */}
            <button
              onClick={() => {
                setRowsPerPage(clients.length);
                setCurrentPage(1);
              }}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-12 rounded-lg shadow-lg max-w-4xl w-full">
            {/* Header */}
            <h2 className="text-2xl font-semibold mb-4">
              {editingClient ? "Edit Client" : "Add Client"}
            </h2>

            {/* Form Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-gray-600 font-medium">
                  Client Name
                </label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientData.name}
                  onChange={(e) =>
                    setClientData({ ...clientData, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Email */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-gray-600 font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={clientData.email}
                  onChange={(e) =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Phone */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-gray-600 font-medium">Phone</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={clientData.phone}
                  onChange={(e) =>
                    setClientData({ ...clientData, phone: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-gray-600 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={clientData.address}
                  onChange={(e) =>
                    setClientData({ ...clientData, address: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Assigned Employees List */}
              <div className="col-span-2 mt-4">
                <h3 className="text-lg font-bold mb-2">Assign Employees</h3>
                <div className="border rounded p-3 max-h-[200px] overflow-y-auto">
                  {employees.map((emp) => (
                    <label
                      key={emp.employee_no}
                      className="flex items-center space-x-2 p-1 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={clientData.employee_numbers.includes(
                          emp.employee_no
                        )}
                        onChange={() => {
                          const selectedEmployees = new Set(
                            clientData.employee_numbers
                          );
                          selectedEmployees.has(emp.employee_no)
                            ? selectedEmployees.delete(emp.employee_no)
                            : selectedEmployees.add(emp.employee_no);
                          setClientData({
                            ...clientData,
                            employee_numbers: Array.from(selectedEmployees),
                          });
                        }}
                      />
                      <span>
                        {emp.name} - {emp.employee_no}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={handleSubmit}
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopupMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowPopupMessage(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            {/* Header */}
            <h2
              className={`text-center text-xl font-bold mb-4 ${
                popupType === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {popupType === "error" ? "Error" : "Success"}
            </h2>

            {/* Message */}
            <p className="text-center mb-4">{popupMessage}</p>

            {/* Close Button */}
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
                onClick={() => setShowPopupMessage(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowDeletePopup(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            {/* Confirmation Text */}
            <h2 className="text-xl font-bold text-center mb-4">
              Confirm Delete
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Are you sure you want to delete this client? This action cannot be
              undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteClient}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
