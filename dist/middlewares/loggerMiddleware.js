"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Request logger middleware
const logger = (req, res, next) => {
    console.log(req.method, req.url, req);
    next();
};
exports.default = logger;
//# sourceMappingURL=loggerMiddleware.js.map