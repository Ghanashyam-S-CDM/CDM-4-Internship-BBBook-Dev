import sql from '../loaders/dbLoader'
import {getGroups} from './ModelGroup'
import {getUsers} from './ModelUser'
import {getCommentsFromBooks} from './ModelComment'

export async function booksToFull(books){
	if(!books.length) return {}
	const [groups,comments]=await Promise.all([
		getGroups(books.map(b=>b.group_id)),
		getCommentsFromBooks(books.map(b=>b.id)),
	])
	const users=await getUsers(comments.map(c=>c.user_id))
	return {users,groups,books,comments}
}

export async function getBooks(book_ids){
	if(!book_ids.length) return []
	return await sql`
		select *
		from books_view
		where id in (${book_ids})
	`
}

export async function getBooksFromGroups(group_ids){
	if(!group_ids.length) return []
	return await sql`
		select *
		from books_view
		where group_id in (${group_ids})
	`
}

export async function addBook(book){
	return await sql`
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
	`
}