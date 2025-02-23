import React, { useState, useEffect } from "react";
import { LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const CheckpointManagement = () => {
  const [clients, setClients] = useState([]); // Store clients list
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(
          "http://localhost:8590/v1/81guards/client/get"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setClients(data); // Store fetched clients
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  // Handle navigation to checkpoints based on selected client
  const handleCardClick = (client) => {
    navigate("/Checkpoint-history", {
      state: { client }, // Pass entire client object
    });
  };

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <p className="text-[24px] font-semibold">Check-Point Management</p>

      <div className="grid grid-cols-4 gap-6 mt-5">
        {clients.map((client) => (
          <div
            key={client.id}
            className="shadow-md p-5 rounded-lg border-b-4 border-blue-500 bg-white"
          >
            {/* Icon */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-lg p-4 bg-blue-200 text-blue-600 text-2xl w-16 h-16">
                <LuUsers />
              </div>
            </div>

            {/* Client Info */}
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
    </div>
  );
};

export default CheckpointManagement;
