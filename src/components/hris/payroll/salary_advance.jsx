import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const AllowanceComponent = () => {
  // State variables for employee data and pagination
  const [employeeData, setEmployeeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of rows per page
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error"); // "error" or "success"
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [symbol, setSymbol] = useState(Cookies.get("symbol") || "$");
  const [employeeNoFilter, setEmployeeNoFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  // State variables for popup and forms
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading indicator
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const location = useLocation();
  const columnName = location.state?.actual_column_name || "Component Name A";
  const suggestedName = location.state?.suggested_name || "Unknown Component";
  const type = location.state?.type || "Amount";

  useEffect(() => {
    setCurrency(Cookies.get("currency") || "USD");
    setSymbol(Cookies.get("symbol") || "$");
  }, []);

  // Function to fetch all employee data without pagination
  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/hris/payroll/getAllEmployeesWithSalaryAdvanceStatus`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch employee data");
      }
      const data = await response.json();
      if (data.success) {
        const employees = data.data.map((emp, index) => ({
          id: emp.id || index + 1,
          employee_no: emp.employee_no,
          employee_fullname: emp.employee_fullname,
          employee_email: emp.employee_email,
          status: emp.status,
        }));
        setEmployeeData(employees);
        setFilteredData(employees);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch data on component mount and when search parameters change
  useEffect(() => {
    fetchEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnName, employeeNoFilter, employeeNameFilter]);

  // Handler functions for search inputs
  const handleEmployeeNoChange = (e) => setEmployeeNoFilter(e.target.value);
  const handleEmployeeNameChange = (e) => setEmployeeNameFilter(e.target.value);

  // Handler function for search button
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchEmployeeData();
  };

  // Apply filtering
  useEffect(() => {
    let data = employeeData;

    if (employeeNoFilter.trim()) {
      data = data.filter((emp) =>
        emp.employee_no
          .toLowerCase()
          .includes(employeeNoFilter.trim().toLowerCase())
      );
    }

    if (employeeNameFilter.trim()) {
      data = data.filter((emp) =>
        emp.name.toLowerCase().includes(employeeNameFilter.trim().toLowerCase())
      );
    }

    setFilteredData(data);
    setCurrentPage(1); // Reset to first page when filters change
  }, [employeeNoFilter, employeeNameFilter, employeeData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowClick = async (employee) => {
    if (employee.status === "APPLICABLE") {
      // Open the popup with empty fields for applicable employees
      setSelectedEmployee({
        employee_no: employee.employee_no,
        employee_fullname: employee.employee_fullname,
        employee_email: employee.employee_email,
        salaryAdvance: {
          request_date: "",
          advance_amount: "",
          reason: "",
          status: "APPLICABLE",
        },
      });
      setAmount(""); // Reset amount for new entries
      setShowPopup(true);
    } else {
      // Fetch data for non-applicable employees
      try {
        setIsLoading(true); // Indicate loading state
  
        const response = await fetch(
          `https://back-81-guards.casknet.dev/v1/hris/payroll/salary-advance/${employee.employee_no}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch salary advance details");
        }
  
        const data = await response.json();
  
        // Check if salary advance details exist in the fetched data
        const salaryAdvanceDetails = data.data[0] || {
          request_date: "",
          advance_amount: "",
          reason: "",
          status: "NOT APPLICABLE",
        };
  
        // Set the selected employee data and update the amount
        setSelectedEmployee({
          employee_no: employee.employee_no,
          employee_fullname: employee.employee_fullname,
          employee_email: employee.employee_email,
          salaryAdvance: salaryAdvanceDetails,
        });
  
        // Initialize the amount with the fetched advance_amount
        setAmount(salaryAdvanceDetails.advance_amount || ""); 
        setShowPopup(true); // Open the popup
      } catch (error) {
        console.error("Error fetching salary advance details:", error);
        setPopupMessage("Failed to fetch salary advance details.");
        setPopupType("error");
        setShowPopupMessage(true);
      } finally {
        setIsLoading(false); // Remove loading state
      }
    }
  };
  

  // Close popup and reset states
  const closePopup = () => {
    setShowPopup(false);
    setSelectedEmployee(null);
    setAmount("");
    setRate("");
    setShowDeleteConfirm(false);
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate the amount field
      if (!amount.trim() || isNaN(parseFloat(amount))) {
        setPopupMessage("Please provide a valid advance amount.");
        setPopupType("error");
        setShowPopupMessage(true);
        setIsSaving(false);
        return;
      }

      // Construct the payload for saving
      const payload = {
        employee_number: selectedEmployee.employee_no,
        request_date: selectedEmployee.salaryAdvance?.request_date || "",
        advance_amount: parseFloat(amount.trim()),
        reason: selectedEmployee.salaryAdvance?.reason || "No reason provided",
      };

      console.log("Payload for save:", payload);

      // Send the POST request
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/hris/payroll/salary-advance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save salary advance.");
      }

      // Show success message
      setPopupMessage("Salary advance added successfully!");
      setPopupType("success");
      setShowPopupMessage(true);

      // Refresh employee data and close the popup
      await fetchEmployeeData();
      closePopup();
    } catch (error) {
      console.error("Error saving salary advance:", error);
      setPopupMessage(error.message || "Failed to save salary advance.");
      setPopupType("error");
      setShowPopupMessage(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!selectedEmployee.salaryAdvance.id) {
        setPopupMessage("Unable to update: Missing salary advance ID.");
        setPopupType("error");
        setShowPopupMessage(true);
        setIsSaving(false);
        return;
      }

      // Fallback to existing data if fields are not updated
      const formattedDate = selectedEmployee.salaryAdvance.request_date
        ? new Date(selectedEmployee.salaryAdvance.request_date)
            .toISOString()
            .split("T")[0]
        : "";

      const payload = {
        request_date: formattedDate, // Use formatted date from state or existing data
        advance_amount:
          amount.trim() !== ""
            ? parseFloat(amount)
            : parseFloat(selectedEmployee.salaryAdvance.advance_amount),
        reason:
          selectedEmployee.salaryAdvance.reason.trim() !== ""
            ? selectedEmployee.salaryAdvance.reason
            : "No reason provided", // Default reason if empty
        status: selectedEmployee.salaryAdvance.status || "PENDING", // Ensure status is sent correctly
      };
      console.log("sentdata", payload);
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/hris/payroll/salary-advance/${selectedEmployee.salaryAdvance.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update salary advance.");
      }

      setPopupMessage("Salary advance updated successfully!");
      setPopupType("success");
      setShowPopupMessage(true);

      await fetchEmployeeData(); // Refresh the data to show updated status
      closePopup();
    } catch (error) {
      console.error("Error updating salary advance:", error);
      setPopupMessage(error.message || "Failed to update salary advance.");
      setPopupType("error");
      setShowPopupMessage(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Show the delete confirmation popup
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm deletion: make a PUT request with amount: 0.00
  const handleConfirmDelete = async () => {
    try {
      setIsSaving(true);

      const payload = {
        employee_no: selectedEmployee.employee_no,
        actual_column_name: columnName,
        amount: 0.0,
      };

      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/hris/payroll/updateallowancetoemployee`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmployeeData(); // Refresh data
      closePopup();
    } catch (error) {
      console.error("Error deleting allowance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <p className="text-[24px] mb-5">
        Payroll Navigation / Payroll Allowance / Salary Advance
      </p>
      <div className="shadow-lg p-5 rounded-lg  bg-white w-[65%]">
        <p className="text-[24px] mb-4">Search Employee to Assign Value</p>

        {/* Search Fields */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-64"
              placeholder="e.g. EMP001"
              value={employeeNoFilter}
              onChange={handleEmployeeNoChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-64"
              placeholder="e.g. John"
              value={employeeNameFilter}
              onChange={handleEmployeeNameChange}
            />
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5">
          <div className="table-container">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={3}>
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={3}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentData.map((employee) => (
                    <tr
                      key={employee.no}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleRowClick(employee)}
                    >
                      <td className="px-6 py-4">{employee.employee_no}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                            {employee.employee_fullname
                              .split(" ")
                              .map((n) => n[1])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.employee_fullname}
                            </div>
                            {employee.email && (
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-gray-300"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-gray-300"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {showPopup && selectedEmployee && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 text-xl"
              disabled={isSaving}
            >
              &times;
            </button>

            {/* Header */}
            <div className="flex justify-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedEmployee.salaryAdvance?.id
                  ? "Update Salary Advance"
                  : "Add Salary Advance"}
              </h2>
            </div>

            {/* Employee Info */}
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {selectedEmployee.employee_fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedEmployee.employee_fullname}
                </div>
                {selectedEmployee.employee_email && (
                  <div className="text-sm text-gray-500">
                    {selectedEmployee.employee_email}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Salary Advance */}
            <p className="mb-2 flex items-center">
              Existing Advance: &nbsp;
              {selectedEmployee.salaryAdvance?.status ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {selectedEmployee.salaryAdvance.status}
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  No Advance Available
                </span>
              )}
            </p>

            {/* Requested Date */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Date
                </label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={
                    selectedEmployee.salaryAdvance?.request_date
                      ? new Date(selectedEmployee.salaryAdvance.request_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedEmployee((prev) => ({
                      ...prev,
                      salaryAdvance: {
                        ...prev.salaryAdvance,
                        request_date: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* Advance Amount */}
            {/* Advance Amount */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Amount
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-l px-3 py-2 w-full"
                    placeholder="0.00"
                    value={amount || ""} // Use amount state
                    onChange={(e) => {
                      const value = e.target.value;
                      setAmount(value); // Update the amount state
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        salaryAdvance: {
                          ...prev.salaryAdvance,
                          advance_amount: value, // Keep advance_amount synchronized
                        },
                      }));
                    }}
                  />
                  <span className="border border-gray-300 rounded-r px-3 py-2 bg-gray-50">
                    {symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Enter reason"
                  value={selectedEmployee.salaryAdvance?.reason || ""}
                  onChange={(e) =>
                    setSelectedEmployee((prev) => ({
                      ...prev,
                      salaryAdvance: {
                        ...prev.salaryAdvance,
                        reason: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              After you add or update a salary advance, the data will be saved
              to the system.
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={closePopup}
                disabled={isSaving}
              >
                Cancel
              </button>
              {selectedEmployee.salaryAdvance?.id ? (
                <button
                  className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
                  onClick={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? "Updating..." : "Update"}
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              )}
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

      {/* Delete Confirmation Popup */}
      {showPopup && showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 text-xl"
              disabled={isSaving}
            >
              &times;
            </button>

            <h2 className="text-center text-xl font-bold mb-4">Delete?</h2>
            <p className="text-center mb-4">
              Do you want to delete the component:{" "}
              <span className="text-blue-500">{suggestedName}</span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={closePopup}
                disabled={isSaving}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-blue-600"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllowanceComponent;
