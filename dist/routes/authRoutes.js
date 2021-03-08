"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authLoader_1 = __importDefault(require("../loaders/authLoader"));
const authRouter = express_1.Router();
authRouter.post('/api/register', authController_1.register, authController_1.respond.signUp);
authRouter.post('/api/get-email', authController_1.getEmail, authController_1.respond.getEmail);
authRouter.post('/api/sign-up', authController_1.signUp, 
// TODO: Consider logging in here
authController_1.respond.signUp);
authRouter.post('/api/login', authLoader_1.default.authenticate('local', { session: false }), authController_1.serializeUser, authController_1.serializeClient, authController_1.generateAccessToken, authController_1.generateRefreshToken, authController_1.cookieSession, authController_1.cookieActiveUser, authController_1.respond.login);
authRouter.post('/api/refresh', authController_1.validateRefreshToken, authController_1.generateAccessToken, authController_1.cookieActiveUser, authController_1.respond.login);
authRouter.post('/api/logout', authController_1.validateRefreshToken, authController_1.rejectToken, authController_1.cookieDeleteActiveUser, authController_1.respond.logout);
exports.default = authRouter;
//# sourceMappingURL=authRoutes.js.map