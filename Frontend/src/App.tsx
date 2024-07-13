import React, { useState } from "react";
import NewForm from "./Form";
import Modal from "./Modal"; 
import "./App.css";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [recentForm, setRecentForm] = useState<boolean>(false);

  const handleOpenForm = () => {
    setShowForm(true);
    setRecentForm(false);
  };

  const handleOpenRecentForm = () => {
    setShowForm(true);
    setRecentForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setRecentForm(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleOpenForm}>Database Connection</button>
        <button onClick={handleOpenRecentForm}>
          Recent Saved Database Connection
        </button>
      </header>
      <Modal isOpen={showForm} onRequestClose={handleCancel}>
        <NewForm onCancel={handleCancel} recentForm={recentForm} />
      </Modal>
    </div>
  );
};

export default App;
