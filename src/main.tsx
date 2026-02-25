import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx: Attempting to render App");
console.log("main.tsx: Root element:", document.getElementById("root"));

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("main.tsx: root element not found");
    document.body.innerHTML = "<h1>ERROR: root element not found</h1>";
  } else {
    console.log("main.tsx: Creating React root");
    const root = ReactDOM.createRoot(rootElement);
    console.log("main.tsx: Rendering App component");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("main.tsx: App rendered successfully");
  }
} catch (error) {
  console.error("main.tsx: Fatal error:", error);
  document.body.innerHTML = `<h1 style="color:red">ERROR: ${error}</h1>`;
}
