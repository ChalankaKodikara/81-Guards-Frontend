import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CheckPointByClient = () => {
  const location = useLocation();
  const client = location.state?.client || {}; // Retrieve full client details

  const [checkpoints, setCheckpoints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Store QR Code URL

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [editingCheckpoint, setEditingCheckpoint] = useState(null);
  const [checkpointData, setCheckpointData] = useState({
    name: "",
    location_name: "",
    location_address: "",
    employee_ids: [],
  });

  useEffect(() => {
    fetchCheckpoints();
    fetchEmployees();
  }, []);
  // Handle QR Code Download
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `checkpoint-${selectedCheckpoint.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "https://back-81-guards.casknet.dev/v1/81guards/employees/get-all"
      );
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAddCheckpoint = () => {
    setCheckpointData({
      name: "",
      location_name: "",
      location_address: "",
      employee_ids: [],
      client_id: client.id, // Ensure client_id is set when adding
    });
    setSelectedCheckpoint({ employees: [] });
    setEditingCheckpoint(null);
    setIsModalOpen(true);
  };

  // Open the "Edit Checkpoint" modal
  const handleEditCheckpoint = (checkpoint) => {
    setCheckpointData({
      name: checkpoint.name,
      location_name: checkpoint.location_name,
      location_address: checkpoint.location_address,
      employee_ids: checkpoint.employee_ids || [],
    });
    setSelectedCheckpoint(checkpoint);
    setEditingCheckpoint(checkpoint);
    setIsModalOpen(true);
  };
  const handleEmployeeSelection = (employeeNo) => {
    setCheckpointData((prevData) => {
      const selectedEmployees = new Set(prevData.employee_ids);
      if (selectedEmployees.has(employeeNo)) {
        selectedEmployees.delete(employeeNo); // Uncheck - remove from list
      } else {
        selectedEmployees.add(employeeNo); // Check - add to list
      }
      return { ...prevData, employee_ids: Array.from(selectedEmployees) };
    });
  };

  // Handle Add/Edit Checkpoint Submission
  const handleSubmit = async () => {
    try {
      const method = editingCheckpoint ? "PUT" : "POST";
      const endpoint = editingCheckpoint
        ? `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/update?checkpoint_id=${editingCheckpoint.id}`
        : `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/addCheckpoint`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkpointData,
          client_id: client.id, // Ensure client_id is always included
          employee_ids: checkpointData.employee_ids,
        }),
      });

      if (!response.ok) throw new Error("Failed to save checkpoint");
      fetchCheckpoints();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving checkpoint:", error);
    }
  };

  // Open the "View More" modal
  // Open the "View More" modal
  const handleViewMore = async (checkpoint) => {
    try {
      const response = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/getCheckpointWithEmployees?checkpoint_id=${checkpoint.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch checkpoint details");
      const data = await response.json();
      setSelectedCheckpoint(data.checkpoint);
      setShowDetailsPopup(true);

      // Fetch and Set QR Code URL
      const qrCodeResponse = await fetch(
        `https://back-81-guards.casknet.dev/v1/81guards/checkpoints/getCheckpointQRCode?checkpoint_id=${checkpoint.id}`
      );
      if (qrCodeResponse.ok) {
        setQrCodeUrl(qrCodeResponse.url);
      }
    } catch (error) {
      console.error("Error fetching checkpoint details:", error);
    }
  };

  return (
    <div className="mx-5 mt-5 font-montserrat">
      {/* Page Title */}
      <p className="text-[24px] font-semibold">
        Check-Point Management / {client.name}
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
          onClick={handleAddCheckpoint}
        >
          + Add Checkpoint
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
                  <td className="px-4 py-2 flex">
                    <button
                      className="text-blue-500 hover:underline mr-2"
                      onClick={() => handleEditCheckpoint(checkpoint)}
                    >
                      Edit
                    </button>{" "}
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={() => handleViewMore(checkpoint)}
                      >
                        View More
                      </button>
                    </td>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No checkpoints found.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-12 rounded-lg shadow-lg max-w-4xl w-full">
            <h2 className="text-2xl font-semibold mb-4">
              {editingCheckpoint ? "Edit Checkpoint" : "Add Checkpoint"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Input Fields */}
              <input
                type="text"
                placeholder="Checkpoint Name"
                value={checkpointData.name}
                onChange={(e) =>
                  setCheckpointData({ ...checkpointData, name: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Location Name"
                value={checkpointData.location_name}
                onChange={(e) =>
                  setCheckpointData({
                    ...checkpointData,
                    location_name: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Location Address"
                value={checkpointData.location_address}
                onChange={(e) =>
                  setCheckpointData({
                    ...checkpointData,
                    location_address: e.target.value,
                  })
                }
                className="border p-2 rounded col-span-2"
              />

              {/* Employee Selection with Scrollable Box */}
              {/* Employee Selection with Scrollable Box */}
              <div className="mt-4">
                <h3 className="text-lg font-bold">Assign Employees</h3>
                <div className="border rounded p-3 max-h-[200px] overflow-y-auto">
                  {employees.map((emp) => (
                    <label
                      key={emp.employee_no}
                      className="flex items-center space-x-2 p-1 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checkpointData.employee_ids.includes(
                          emp.employee_no
                        )}
                        onChange={() =>
                          handleEmployeeSelection(emp.employee_no)
                        }
                      />
                      <span>
                        {emp.name} - {emp.employee_no}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={handleSubmit}
              >
                Save Checkpoint
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailsPopup && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            <button
              onClick={() => setShowDetailsPopup(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold">{selectedCheckpoint.name}</h2>
            <p className="text-gray-500">{selectedCheckpoint.location_name}</p>
            <p className="text-gray-500">
              {selectedCheckpoint.location_address}
            </p>

            {/* QR Code Preview */}
            {qrCodeUrl && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold mb-2">QR Code</h3>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto w-32 h-32 border border-gray-300 p-2"
                />
                <button
                  className="mt-2 bg-yellow-300 text-black px-4 py-2 rounded"
                  onClick={handleDownloadQR}
                >
                  Download QR Code
                </button>
              </div>
            )}

            {/* Assigned Employees */}
            <div className="mt-4">
              <h3 className="text-lg font-bold">Assigned Employees</h3>
              {selectedCheckpoint.employees?.length > 0 ? (
                <ul className="mt-2">
                  {selectedCheckpoint.employees.map((emp) => (
                    <li
                      key={emp.employee_no}
                      className="p-2 border-b last:border-none"
                    >
                      <p>
                        <span className="font-semibold">{emp.name}</span> -{" "}
                        {emp.designation}
                      </p>
                      <p className="text-sm text-gray-500">
                        {emp.contact_number} | {emp.department}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No employees assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckPointByClient;
