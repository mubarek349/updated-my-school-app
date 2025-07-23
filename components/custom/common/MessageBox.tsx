// components/custom/common/MessageBox.tsx
import React from "react";

interface MessageBoxProps {
  title: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  onClose?: () => void;
  children?: React.ReactNode;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  title,
  message,
  type = "info",
  onClose,
  children,
}) => {
  let bgColorClass = "bg-blue-100 border-blue-400 text-blue-700";
  let titleColorClass = "text-blue-800";

  if (type === "success") {
    bgColorClass = "bg-green-100 border-green-400 text-green-700";
    titleColorClass = "text-green-800";
  } else if (type === "error") {
    bgColorClass = "bg-red-100 border-red-400 text-red-700";
    titleColorClass = "text-red-800";
  } else if (type === "warning") {
    bgColorClass = "bg-yellow-100 border-yellow-400 text-yellow-700";
    titleColorClass = "text-yellow-800";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl max-w-sm w-full border ${bgColorClass}`}
      >
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-3 ${titleColorClass}`}>
            {title}
          </h3>
          <p className="text-gray-700 mb-4">{message}</p>
          {children}
          {onClose && (
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
