"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const challenge_routes_1 = __importDefault(require("./routes/challenge.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/vehicles', vehicle_routes_1.default);
app.use('/challenges', challenge_routes_1.default);
app.use('/notifications', notification_routes_1.default);
app.use('/categories', category_routes_1.default);
// Welcome Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Street Race X API'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        statusCode,
        details: err.details || []
    });
});
exports.default = app;
