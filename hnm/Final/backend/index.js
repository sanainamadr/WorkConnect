import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { setMaxListeners } from "events";
import { Server } from "socket.io";
import http from "http";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import employerRoutes from "./routes/employer.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import messageRoutes from "./routes/message.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();
setMaxListeners(20);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5500", "http://localhost:5501", "http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:3000", "http://127.0.0.1:3000", "file://"], // Allow multiple origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5500", "http://localhost:5501", "http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      socket.emit("registered", userId.toString());
    }
  });

  socket.on("disconnect", () => {});
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Backend server is running",
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/employer", employerRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);


// Start server
server.listen(port, () => {
  connectDB();
  console.log("Server is started ",port);
});