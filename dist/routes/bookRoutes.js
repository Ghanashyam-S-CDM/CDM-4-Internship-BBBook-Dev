"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../utils");
const ModelBook_1 = require("../models/ModelBook");
const bookRouter = new express_1.Router();
bookRouter.get('/api/book-full/:book_id', async function (req, res, next) {
    try {
        utils_1.sendJson(req, res, await ModelBook_1.booksToFull(await ModelBook_1.getBooks([req.params.book_id])));
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
bookRouter.post('/api/book', async function (req, res, next) {
    try {
        const book_id = (await ModelBook_1.addBook(req.body))[0].id;
        utils_1.sendJson(req, res, {
            book_id,
            ...await ModelBook_1.booksToFull(await ModelBook_1.getBooks([book_id]))
        });
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
});
exports.default = bookRouter;
//# sourceMappingURL=bookRoutes.js.map