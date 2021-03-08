"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// HTTP to HTTPS redirect middleware
const httpsRedirect = (req, res, next) => req.secure ? next() : res.redirect('https://' + req.headers.host + req.url);
exports.default = httpsRedirect;
//# sourceMappingURL=httpsRedirect.js.map