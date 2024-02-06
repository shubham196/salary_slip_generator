import React, { useState } from "react";

const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateUser({ name, designation });
    setName("");
    setDesignation("");
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? "is-active" : ""}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content">
        <div className="box">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Name</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Designation</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="button is-primary">
              Create User
            </button>
          </form>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={onClose}
      ></button>
    </div>
  );
};

export default CreateUserModal;
