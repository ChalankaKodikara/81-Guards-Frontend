import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmpOnboard = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const [employeeData, setEmployeeData] = useState({
    employee_no: "",
    name: "",
    nic: "",
    date_of_birth: "",
    contact_number: "",
    address: "",
    employee_category: "",
    employee_type: "",
    department: "",
    designation: "",
    work_location: "",
  });

  const [errors, setErrors] = useState({});
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); // "success" or "error"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prevData) => ({
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
    Object.keys(employeeData).forEach((key) => {
      if (!employeeData[key]) {
        formErrors[key] = "This field is required";
      }
    });
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/employees/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setPopupMessage("Employee added successfully!");
        setPopupType("success");
        setShowPopupMessage(true);

        setTimeout(() => {
          setShowPopupMessage(false);
          navigate("/emp-details"); // Redirect after success
        }, 3000);

        setEmployeeData({
          employee_no: "",
          name: "",
          nic: "",
          date_of_birth: "",
          contact_number: "",
          address: "",
          employee_category: "",
          employee_type: "",
          department: "",
          designation: "",
          work_location: "",
        });
      } else {
        setPopupMessage(result.message || "Failed to add employee");
        setPopupType("error");
        setShowPopupMessage(true);

        setTimeout(() => {
          setShowPopupMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting employee data:", error);
      setPopupMessage("Error submitting employee data.");
      setPopupType("error");
      setShowPopupMessage(true);

      setTimeout(() => {
        setShowPopupMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md overflow-y-auto h-screen">
      <h2 className="text-2xl font-bold mb-6">Employee Onboarding</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(employeeData).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-gray-700 capitalize">
              {key.replace("_", " ")}
            </label>
            <input
              type={key === "date_of_birth" ? "date" : "text"}
              name={key}
              value={employeeData[key]}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            {errors[key] && (
              <p className="text-red-500 text-sm">{errors[key]}</p>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {/* Popup Message */}
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => setShowPopupMessage(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpOnboard;
