import React, { useState, useEffect } from "react";
import { LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const CheckpointManagement = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(
          "https://back-81-guards.casknet.dev/v1/81guards/client/get"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  const handleCardClick = (client) => {
    navigate("/Checkpoint-history", {
      state: { client },
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(clients.length / clientsPerPage);
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  const goToPage = (page) => setCurrentPage(page);

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <p className="text-[24px] font-semibold">Check-Point Management</p>

      <div className="grid grid-cols-4 gap-6 mt-5">
        {currentClients.map((client) => (
          <div
            key={client.id}
            className="shadow-md p-5 rounded-lg border-b-4 border-blue-500 bg-white"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-lg p-4 bg-blue-200 text-blue-600 text-2xl w-16 h-16">
                <LuUsers />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-lg font-semibold">{client.name}</p>
              <p className="text-gray-600 text-sm">{client.address}</p>

              <div className="mt-3">
                <button
                  className="border border-blue-400 bg-white text-blue-400 p-2 rounded-lg text-[15px] hover:bg-blue-400 hover:text-white transition"
                  onClick={() => handleCardClick(client)}
                >
                  View Checkpoints
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {clients.length > clientsPerPage && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            >
              {i + 1}
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
        </div>
      )}
    </div>
  );
};

export default CheckpointManagement; 
