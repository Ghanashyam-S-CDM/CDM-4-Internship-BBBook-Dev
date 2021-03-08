"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJson = void 0;
const http_status_codes_1 = require("http-status-codes");
function sendJson(req, res, data, status = http_status_codes_1.StatusCodes.OK) {
    res.status(status).json({ data, token: req.token?.accessToken });
}
exports.sendJson = sendJson;
//# sourceMappingURL=utils.js.map