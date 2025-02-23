import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmpOnboard = () => {
  const navigate = useNavigate();
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
    alert("Form submitted successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Employee Onboarding</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {Object.keys(employeeData).map((key, index) =>
          key === "employee_category" ? (
            <div key={index} className="flex flex-col">
              <label className="text-gray-700 font-medium capitalize mb-1">
                Employee Category *
              </label>
              <select
                name={key}
                value={employeeData[key]}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                <option value="Security">Security</option>
                <option value="Office">Office</option>
              </select>
              {errors[key] && (
                <p className="text-red-500 text-sm">{errors[key]}</p>
              )}
            </div>
          ) : (
            <div key={index} className="flex flex-col">
              <label className="text-gray-700 font-medium capitalize mb-1">
                {key.replace(/_/g, " ")} *
              </label>
              <input
                type={key === "date_of_birth" ? "date" : "text"}
                name={key}
                value={employeeData[key]}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors[key] && (
                <p className="text-red-500 text-sm">{errors[key]}</p>
              )}
            </div>
          )
        )}
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full bg-yellow-300 text-black p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpOnboard;
