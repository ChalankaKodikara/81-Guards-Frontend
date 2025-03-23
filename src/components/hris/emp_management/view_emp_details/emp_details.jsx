import React, { useState, useEffect } from "react";
import { LuEye } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import Cookies from "js-cookie";
import EmployeeEdit from "./emp_edit"; // Import the new Edit component

const EmployeeTable = () => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchById, setSearchById] = useState("");
  const [searchByName, setSearchByName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployeeNo, setSelectedEmployeeNo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const userId = Cookies.get("employee_no");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://back-81-guards.casknet.dev/v1/81guards/employees/get-all`
        );
        const data = await response.json();
        if (data && Array.isArray(data.employees)) {
          setEmployees(data.employees);
          setFilteredEmployees(data.employees);
          setDepartments([
            ...new Set(data.employees.map((emp) => emp.department)),
          ]);
        } else {
          console.error("Invalid data format received:", data);
          setEmployees([]);
          setFilteredEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const applyFilters = () => {
    let filtered = employees;
    if (selectedDepartment) {
      filtered = filtered.filter(
        (emp) => emp.department === selectedDepartment
      );
    }
    if (searchById) {
      filtered = filtered.filter((emp) => emp.employee_no.includes(searchById));
    }
    if (searchByName) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchByName.toLowerCase())
      );
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const totalPages = filteredEmployees.length
    ? Math.ceil(filteredEmployees.length / rowsPerPage)
    : 1;

  const currentRows = Array.isArray(filteredEmployees)
    ? filteredEmployees.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      )
    : [];

  return (
    <div className="p-6 bg-white shadow rounded-lg overflow-y-auto h-[600px]">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Employee List
      </h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          value={searchById}
          onChange={(e) => setSearchById(e.target.value)}
          placeholder="Search by ID"
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={searchByName}
          onChange={(e) => setSearchByName(e.target.value)}
          placeholder="Search by Name"
          className="border p-2 rounded"
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <button
          onClick={applyFilters}
          className="bg-yellow-300 text-black px-4 py-2 rounded flex items-center gap-2"
        >
          <CiSearch /> Search
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">NIC</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Designation</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((emp) => (
                <tr key={emp.employee_no} className="border-t">
                  <td className="px-4 py-2">{emp.employee_no}</td>
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.nic}</td>
                  <td className="px-4 py-2">{emp.department}</td>
                  <td className="px-4 py-2">{emp.designation}</td>
                  <td className="px-4 py-2 flex gap-3">
                    <LuEye className="cursor-pointer" />
                    <FaEdit
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedEmployeeNo(emp.employee_no);
                        setShowEditModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredEmployees.length)} of{" "}
              {filteredEmployees.length}
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

              {/* Rows Per Page Dropdown */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 border p-1 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              {/* Show All Button */}
              <button
                onClick={() => {
                  setRowsPerPage(filteredEmployees.length);
                  setCurrentPage(1);
                }}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
              >
                Show All
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <EmployeeEdit
          employeeNo={selectedEmployeeNo}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default EmployeeTable;
