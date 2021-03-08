import sql from '../loaders/dbLoader'

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

export async function getCommentsFromBooks(book_ids){
	if(!book_ids.length) return []
	return await sql`
		select *
		from comments_view
		where book_id in (${book_ids})
	`
}

export async function addComment(comment){
	return await sql`
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
	`
}

export async function deleteComment(comment_id){
	return await sql`
		update comments 
		set hidden = true
		where id = ${comment_id}
		returning *
	`
}