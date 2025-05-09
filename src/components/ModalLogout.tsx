import React from "react";

interface ModalLogoutProps {
  open: boolean;
  onCancel: () => void;
  onLogout: () => void;
}

export default function ModalLogout({ open, onCancel, onLogout }: ModalLogoutProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-2 text-black">Logout</h2>
        <p className="text-gray-500 mb-6">Are you sure want to logout?</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
