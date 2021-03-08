"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.getCommentsFromBooks = void 0;
const dbLoader_1 = __importDefault(require("../loaders/dbLoader"));
// export async function commentsToFull(comments){
// 	if(!comments.length) return {}
// 	return {comments}
// }
//
// export async function getComments(comment_ids){
// 	if(!comment_ids.length) return[]
// 	return await sql`
// 		select *
// 		from comments_view
// 		where id in (${comment_ids})
// 	`
// }
async function getCommentsFromBooks(book_ids) {
    if (!book_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from comments_view
		where book_id in (${book_ids})
	`;
}
exports.getCommentsFromBooks = getCommentsFromBooks;
async function addComment(comment) {
    return await dbLoader_1.default `
		insert into comments (body,book_id,comment_type,hashtags,reply_to_id,selection_data,user_id)
		values (
			${comment.body},
			${comment.book_id},
			${comment.comment_type},
			${comment.hashtags},
			${comment.reply_to_id},
			${comment.selection_data},
			${comment.user_id}
		)
		returning id
	`;
}
exports.addComment = addComment;
async function deleteComment(comment_id) {
    return await dbLoader_1.default `
		update comments 
		set hidden = true
		where id = ${comment_id}
		returning *
	`;
}
exports.deleteComment = deleteComment;
//# sourceMappingURL=ModelComment.js.map