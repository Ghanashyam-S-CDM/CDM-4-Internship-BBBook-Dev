import {Router} from 'express'
import {sendJson} from '../utils'
import {addBook,booksToFull,getBooks} from '../models/ModelBook'
import {addComment} from '../models/ModelComment'

const bookRouter=new Router()

bookRouter.get('/api/book-full/:book_id',
	async function (req,res,next){
		try{
			sendJson(req,res,await booksToFull(await getBooks([req.params.book_id])))
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

bookRouter.post('/api/book',
	async function (req,res,next){
		try{
			const book_id=(await addBook(req.body))[0].id
			sendJson(req,res,{
				book_id,
				...await booksToFull(await getBooks([book_id]))
			})
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

export default bookRouter