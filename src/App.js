import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Topic from "./Topic";

function App() {
  return (
    <div className="App">
      <Routes basename="/addition">
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<Topic />} />
      </Routes>
    </div>
  );
}

export default App;
