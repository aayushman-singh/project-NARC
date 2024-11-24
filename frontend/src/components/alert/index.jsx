import React from "react";
import { XCircle, CheckCircle } from "lucide-react";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-green-500 text-green-100 border-green-700",
    error: "bg-red-500 text-red-100 border-red-700",
    info: "bg-blue-500 text-blue-100 border-blue-700",
    warning: "bg-yellow-500 text-yellow-100 border-yellow-700",
  };

  const icon = {
    success: <CheckCircle className="text-green-200" />,
    error: <XCircle className="text-red-200" />,
    info: <XCircle className="text-blue-200" />,
    warning: <XCircle className="text-yellow-200" />,
  };

  return (
    <div
      className={`flex items-center p-4 border-l-4 rounded-md ${alertStyles[type]} shadow-lg`}
    >
      <div className="mr-3">{icon[type]}</div>
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-3 text-white hover:text-gray-300 transition-transform transform hover:scale-110"
      >
        ✕
      </button>
    </div>
  );
};

export default Alert;
