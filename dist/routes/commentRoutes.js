"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const utils_1 = require("../utils");
const ModelComment_1 = require("../models/ModelComment");
const ModelBook_1 = require("../models/ModelBook");
const commentRouter = new express_1.Router();
commentRouter.post('/api/comment', authController_1.authenticate, async function (req, res, next) {
    try {
        const comment_id = (await ModelComment_1.addComment(req.body))[0].id;
        utils_1.sendJson(req, res, {
            comment_id,
            ...await ModelBook_1.booksToFull(await ModelBook_1.getBooks([req.body.book_id])),
        });
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
commentRouter.delete('/api/comment', authController_1.authenticate, async function (req, res, next) {
    try {
        const { comment_id } = req.body;
        const { book_id } = (await ModelComment_1.deleteComment(comment_id))[0];
        utils_1.sendJson(req, res, {
            comment_id,
            ...await ModelBook_1.booksToFull(await ModelBook_1.getBooks([book_id])),
        });
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
exports.default = commentRouter;
//# sourceMappingURL=commentRoutes.js.map