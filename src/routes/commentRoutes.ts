import {Router} from 'express'
import {authenticate} from '../controllers/authController'
import {sendJson} from '../utils'
import {addComment,deleteComment} from '../models/ModelComment'
import {booksToFull,getBooks} from '../models/ModelBook'

const commentRouter=new Router()

commentRouter.post('/api/comment',
	authenticate,
	async function (req,res,next){
		try{
			const comment_id=(await addComment(req.body))[0].id
			sendJson(req,res,{
				comment_id,
				...await booksToFull(await getBooks([req.body.book_id])),
			})
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

commentRouter.delete('/api/comment',
	authenticate,
	async function (req,res,next){
		try{
			const {comment_id}=req.body
			const {book_id}=(await deleteComment(comment_id))[0]
			sendJson(req,res,{
				comment_id,
				...await booksToFull(await getBooks([book_id])),
			})
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

export default commentRouter