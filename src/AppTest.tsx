import { useState } from "react";

export default function AppTest() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: "50px", 
      backgroundColor: "#0b0f19", 
      color: "white",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>🍽️ The Unusual Chop Planner - TEST</h1>
      <p>React is working! ✓</p>
      <p>Click count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0D47A1",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Click me
      </button>
    </div>
  );
}
