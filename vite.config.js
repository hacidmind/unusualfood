import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var repoName = "FoodApp";
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        plugins: [react()],
        base: command === "build" ? "/".concat(repoName, "/") : "/"
    });
});
