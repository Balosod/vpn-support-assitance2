/**
 * Server entry point
 *
 * Creates the Express application and starts the HTTP server.
 */
import { createApp } from "./app.js";
import { config } from "./config/environment.js";
// Initialize the Express application
const app = createApp();
const port = config.PORT;
// Start listening for incoming requests
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📝 Environment: ${config.NODE_ENV}`);
    console.log(`🚀 Ready to accept requests`);
});
