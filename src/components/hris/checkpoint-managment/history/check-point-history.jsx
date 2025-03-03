import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx"; // Import for Excel Export

const CheckPointHistory = () => {
  const location = useLocation();
  const client = location.state?.client || {}; // Retrieve full client details

  const [checkpoints, setCheckpoints] = useState([]);
  const [scanHistory, setScanHistory] = useState([]); // Store scan history
  const [filteredHistory, setFilteredHistory] = useState([]); // Filtered scan data
  const [search, setSearch] = useState({
    employee_no: "",
    start_date: "",
    end_date: "",
    time: "",
  }); // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5); // Set records per page
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data is loaded

  const [uniqueCheckpoints, setUniqueCheckpoints] = useState([]); // Dropdown options

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  // Fetch all checkpoints for the client
  const fetchCheckpoints = async () => {
    if (!client.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/getCheckpointsByClient?client_id=${client.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch checkpoints");
      const data = await response.json();
      setCheckpoints(data.checkpoints || []);
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch checkpoint history by checkpoint_id
  const fetchCheckpointHistory = async (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setScanHistory([]); // Clear previous history
    setShowDetailsPopup(true);

    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/getcheckpointhistory?checkpoint_id=${checkpoint.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch checkpoint history");

      const data = await response.json();
      setScanHistory(data.scanDetails || []);
      setFilteredHistory(data.scanDetails || []); // Initialize with all data
    } catch (error) {
      console.error("Error fetching checkpoint history:", error);
    }
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHistory.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);

  // Fetch scan history for employee
  const fetchHistoryByEmployee = async () => {
    if (!employeeSearch) {
      alert("Please enter an Employee Number!");
      return;
    }

    setLoading(true);
    setDataLoaded(false);

    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/getScansByEmployee?employee_no=${employeeSearch}`
      );
      if (!response.ok) throw new Error("Failed to fetch history by employee");

      const data = await response.json();
      setScanHistory(data.scanDetails || []);
      setFilteredHistory(data.scanDetails || []);

      // ✅ Ensure unique checkpoint names using `Map()`
      const uniqueCheckpointMap = new Map();
      (data.scanDetails || []).forEach((scan) => {
        if (!uniqueCheckpointMap.has(scan.checkpoint_id)) {
          uniqueCheckpointMap.set(scan.checkpoint_id, {
            id: scan.checkpoint_id,
            name: scan.checkpoint_name,
          });
        }
      });

      setUniqueCheckpoints(Array.from(uniqueCheckpointMap.values())); // Store unique checkpoints
      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching history by employee:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export Data to Excel
  const exportToExcel = () => {
    if (filteredHistory.length === 0) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredHistory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ScanHistory");
    XLSX.writeFile(workbook, "ScanHistory.xlsx");
  };

 
  // Reset Filters
  const resetFilters = () => {
    setSearch({
      start_date: "",
      end_date: "",
      checkpoint_id: "",
    });
    setFilteredHistory(scanHistory);
    setCurrentPage(1);
  };

  // Apply Filters
  const applyFilters = () => {
    let filteredData = scanHistory;

    if (search.start_date && search.end_date) {
      filteredData = filteredData.filter(
        (scan) =>
          scan.scan_date >= search.start_date &&
          scan.scan_date <= search.end_date
      );
    }

    if (search.checkpoint_id) {
      filteredData = filteredData.filter(
        (scan) => scan.checkpoint_id === parseInt(search.checkpoint_id)
      );
    }

    setFilteredHistory(filteredData);
    setCurrentPage(1); // Reset pagination to page 1
  };
  return (
    <div className="mx-5 mt-5 font-montserrat">
      {/* Page Title */}
      <p className="text-[24px] font-semibold">
        Check-Point History / {client.name}
      </p>

      {/* Client Details */}
      <div className="bg-white p-6 rounded-lg mt-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{client.name}</h2>
          <p className="text-gray-500">{client.email}</p>
          <p className="text-gray-500">{client.phone}</p>
          <p className="text-gray-500">{client.address}</p>
        </div>
        {/* Add Checkpoint Button */}
        <button
          className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-black hover:text-white"
          onClick={() => setShowEmployeePopup(true)}
        >
          + Get According to Employee
        </button>
      </div>

      {/* Checkpoints Table */}
      <div className="mt-5 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-3">Checkpoints</h2>
        {isLoading ? (
          <p>Loading checkpoints...</p>
        ) : checkpoints.length > 0 ? (
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Checkpoint Name</th>
                <th className="px-4 py-2">Location Name</th>
                <th className="px-4 py-2">Location Address</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((checkpoint) => (
                <tr key={checkpoint.id} className="border-t">
                  <td className="px-4 py-2">{checkpoint.name}</td>
                  <td className="px-4 py-2">{checkpoint.location_name}</td>
                  <td className="px-4 py-2">{checkpoint.location_address}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => fetchCheckpointHistory(checkpoint)}
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No checkpoints found.</p>
        )}
      </div>
      {showEmployeePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-2/3 relative h-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowEmployeePopup(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-3">
              Get Scan History by Employee
            </h2>

            {/* Instruction Note */}
            {!dataLoaded && (
              <p className="text-gray-500 mb-2">
                To get scan history, enter Employee Number first.
              </p>
            )}

            {/* Loader */}
            {loading && (
              <div className="flex justify-center my-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            )}

            {/* Employee Input & Button (Hide after data loads) */}
            {!dataLoaded && !loading && (
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Employee No"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={fetchHistoryByEmployee}
                  className="bg-yellow-300 text-black px-4 py-2 rounded"
                >
                  Get Scan History
                </button>
              </div>
            )}

            {/* Filters & Table (Show after data loads) */}
            {dataLoaded && (
              <>
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <input
                    type="date"
                    value={search.start_date}
                    onChange={(e) =>
                      setSearch({ ...search, start_date: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="date"
                    value={search.end_date}
                    onChange={(e) =>
                      setSearch({ ...search, end_date: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />

                  {/* Checkpoint Dropdown */}
                  <select
                    value={search.checkpoint_id}
                    onChange={(e) =>
                      setSearch({ ...search, checkpoint_id: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  >
                    <option value="">All Checkpoints</option>
                    {uniqueCheckpoints.map((checkpoint) => (
                      <option key={checkpoint.id} value={checkpoint.id}>
                        {checkpoint.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={applyFilters}
                    className="bg-yellow-300 text-black px-4 py-2 rounded"
                  >
                    Apply Filter
                  </button>
                  <button
                    onClick={resetFilters}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Reset
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Export to Excel
                  </button>
                </div>

                {/* Table */}
                <table className="w-full border-collapse bg-white text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Employee No</th>
                      <th className="px-4 py-2">Checkpoint</th>
                      <th className="px-4 py-2">Scan Date</th>
                      <th className="px-4 py-2">Scan Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((scan) => (
                      <tr key={scan.id}>
                        <td className="px-4 py-2">{scan.employee_no}</td>
                        <td className="px-4 py-2">{scan.checkpoint_name}</td>
                        <td className="px-4 py-2">{scan.scan_date}</td>
                        <td className="px-4 py-2">{scan.scan_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkpoint History Modal */}
      {showDetailsPopup && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-2/3 relative h-[70%] overflow-y-auto">
            <button
              onClick={() => setShowDetailsPopup(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">
              {selectedCheckpoint.name}
            </h2>

            {/* Filtering Inputs */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Employee No"
                value={search.employee_no}
                onChange={(e) =>
                  setSearch({ ...search, employee_no: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={search.start_date}
                onChange={(e) =>
                  setSearch({ ...search, start_date: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={search.end_date}
                onChange={(e) =>
                  setSearch({ ...search, end_date: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <button
                onClick={applyFilters}
                className="bg-yellow-300 text-black px-4 py-2 rounded"
              >
                Apply Filter
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-auto flex-grow ">
              <h3 className="text-lg font-bold mb-3"> Scan History</h3>
              {currentRecords.length > 0 ? (
                <table className="w-full border-collapse bg-white text-left text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Employee No</th>
                      <th className="px-4 py-2">Location Name</th>
                      <th className="px-4 py-2">Scan Date</th>
                      <th className="px-4 py-2">Scan Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((scan) => (
                      <tr key={scan.id} className="border-t">
                        <td className="px-4 py-2">{scan.employee_no}</td>
                        <td className="px-4 py-2">{scan.location_name}</td>
                        <td className="px-4 py-2">{scan.scan_date}</td>
                        <td className="px-4 py-2">{scan.scan_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 mt-2">No scan history available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckPointHistory;
