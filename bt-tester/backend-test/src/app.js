import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productRoutes.js";
import servicesRoutes from "./routes/serviceRoutes.js";
import bookingsRoutes from "./routes/bookingRoutes.js";
import ordersRoutes from "./routes/orderRoutes.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BT E-Commerce API",
            version: "1.0.0",
            description: "API documentation for sales and services e-commerce platform",
        },
        servers: [
            {
                url: "http://localhost:5000/api",
            },
        ],
    },
    apis: ["./src/routes/*.js"], // scan your routes files for docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/orders", ordersRoutes);

// catch-all: if someone hits root, show customers/homepage.html if present
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "customers/homepage.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`wow the Server running on port ${PORT}`));
