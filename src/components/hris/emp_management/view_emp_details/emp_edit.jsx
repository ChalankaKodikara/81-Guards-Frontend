import React, { useState, useEffect } from "react";

const EmployeeEdit = ({ employeeNo, onClose }) => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching employee data for: ${employeeNo}`);
        const response = await fetch(
          `https://back-81-guards.casknet.dev/v1/81guards/employees/employee?employee_no=${employeeNo}`
        );
        if (!response.ok) throw new Error("Failed to fetch employee data");

        const data = await response.json();
        console.log("API Response:", data);

        if (data && data.employee) {
          setEmployeeData(data.employee);
        } else {
          setError("Employee data not found.");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Error fetching employee data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeNo, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prevData) => ({
      ...prevData,
      [name]: name === "active_status" ? value === "true" : value, // Ensure correct boolean type for active_status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating employee data:", employeeData);
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/employees/employee?employee_no=${employeeNo}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        }
      );

      if (response.ok) {
        setPopupMessage("Employee updated successfully!");
        setPopupType("success");
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          onClose();
        }, 3000);
      } else {
        setPopupMessage("Failed to update employee.");
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setPopupMessage("Error updating employee.");
      setPopupType("error");
      setShowPopup(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[500px] relative">
        <h2 className="text-lg font-bold mb-4">Edit Employee</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="text-red-500 text-center">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 bg-gray-500 text-white px-2 py-1 rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={employeeData.name || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={employeeData.nic || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={employeeData.date_of_birth || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Contact Number</label>
                <input
                  type="text"
                  name="contact_number"
                  value={employeeData.contact_number || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={employeeData.address || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={employeeData.department || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={employeeData.designation || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Work Location</label>
                <input
                  type="text"
                  name="work_location"
                  value={employeeData.work_location || ""}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Active Status</label>
                <select
                  name="active_status"
                  value={employeeData.active_status ? "true" : "false"}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-300 text-black px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* Popup Message */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
              <h2
                className={`text-center text-xl font-bold mb-4 ${
                  popupType === "error" ? "text-red-500" : "text-green-500"
                }`}
              >
                {popupType === "error" ? "Error" : "Success"}
              </h2>
              <p className="text-center mb-4">{popupMessage}</p>
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
                  onClick={() => setShowPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeEdit;
