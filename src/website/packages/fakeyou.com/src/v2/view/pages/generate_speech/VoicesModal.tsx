import React from "react";

interface Props {
  onClose: () => void;
}

const VoicesModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="modal bg-translucent" style={{ display: "block" }}>
      <div className="modal-dialog-centered container">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">title</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          {/* Body */}
          <div className="modal-body">body</div>
        </div>
      </div>
    </div>
  );
};

export default VoicesModal;
