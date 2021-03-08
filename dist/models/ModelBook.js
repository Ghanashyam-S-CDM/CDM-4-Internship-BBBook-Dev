"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBook = exports.getBooksFromGroups = exports.getBooks = exports.booksToFull = void 0;
const dbLoader_1 = __importDefault(require("../loaders/dbLoader"));
const ModelGroup_1 = require("./ModelGroup");
const ModelUser_1 = require("./ModelUser");
const ModelComment_1 = require("./ModelComment");
async function booksToFull(books) {
    if (!books.length)
        return {};
    const [groups, comments] = await Promise.all([
        ModelGroup_1.getGroups(books.map(b => b.group_id)),
        ModelComment_1.getCommentsFromBooks(books.map(b => b.id)),
    ]);
    const users = await ModelUser_1.getUsers(comments.map(c => c.user_id));
    return { users, groups, books, comments };
}
exports.booksToFull = booksToFull;
async function getBooks(book_ids) {
    if (!book_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from books_view
		where id in (${book_ids})
	`;
}
exports.getBooks = getBooks;
async function getBooksFromGroups(group_ids) {
    if (!group_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from books_view
		where group_id in (${group_ids})
	`;
}
exports.getBooksFromGroups = getBooksFromGroups;
async function addBook(book) {
    return await dbLoader_1.default `
		insert into books (title,author_name,description,isbn,file,group_id,thumbnail)
		values (
			${book.title},
			${book.author_name},
			${book.description},
			${book.isbn},
			${book.file},
			${book.group_id},
			${book.thumbnail}
		)
		returning id
	`;
}
exports.addBook = addBook;
//# sourceMappingURL=ModelBook.js.map