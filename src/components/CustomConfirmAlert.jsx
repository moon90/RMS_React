import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import '../styles/CustomConfirmAlert.css';

const showCustomConfirmAlert = ({ title, message, onConfirm, onCancel }) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className="custom-ui">
          <h1 className="text-xl font-bold mb-4">{title}</h1>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={() => {
                if (onCancel) onCancel();
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      );
    }
  });
};

export default showCustomConfirmAlert;
