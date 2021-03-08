"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = void 0;
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.isDevelopment = (process.env.NODE_ENV === 'development');
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import https from 'https'
// import fs from 'fs'
const authLoader_1 = __importDefault(require("./loaders/authLoader"));
const corsLoader_1 = __importDefault(require("./loaders/corsLoader"));
const loggerMiddleware_1 = __importDefault(require("./middlewares/loggerMiddleware"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const httpsRedirect_1 = __importDefault(require("./middlewares/httpsRedirect"));
const app = express_1.default();
// Middlewares
!exports.isDevelopment && app.use(httpsRedirect_1.default);
app.use(express_1.default.json({ limit: '50mb' })); // JSON body parser
app.use(cookie_parser_1.default());
app.use(authLoader_1.default.initialize());
app.use(corsLoader_1.default);
exports.isDevelopment && app.use(loggerMiddleware_1.default);
// Routes
// TODO: Scoping /api
app.get('/api/test', (req, res) => res.json({ yep: 'world' }));
app.use(authRoutes_1.default);
app.use(groupRoutes_1.default);
app.use(bookRoutes_1.default);
app.use(commentRoutes_1.default);
// Finally serve public folder
app.use(express_1.default.static('public'));
app.get('*', (req, res) => res.sendFile('public/index.html'));
// https.createServer({
// 	key: fs.readFileSync('certs/server.key'),
// 	cert: fs.readFileSync('certs/server.cert'),
// },app)
app.listen(process.env.PORT, () => console.log(`Listening on https://localhost:${process.env.PORT}`));
exports.default = app;
//# sourceMappingURL=index.js.map