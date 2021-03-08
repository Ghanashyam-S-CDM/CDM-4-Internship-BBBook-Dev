import {Router} from 'express'

import {
	groupsToFull,
	getGroupsFromUsers,
	getGroups,
	addGroup,
	editGroup,addGroupMember,archiveGroup,
} from '../models/ModelGroup'
import {authenticate} from '../controllers/authController'
import {sendJson} from '../utils'

const groupRouter=Router()

groupRouter.get('/api/groups-full',
	authenticate,
	async function (req,res,next){
		try{
			sendJson(req,res,await groupsToFull(await getGroupsFromUsers([req.user.id])))
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

groupRouter.get('/api/group-full/:group_id',
	// authenticate,
	async function (req,res,next){
		try{
			sendJson(req,res,await groupsToFull(await getGroups([req.params.group_id])))
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

groupRouter.post('/api/group',
	authenticate,
	async function (req,res,next){
		try{
			const {group_id}=(await addGroup(req.body))[0]
			sendJson(req,res,{
				group_id,
				...(await groupsToFull(await getGroups([group_id])))
			})
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

groupRouter.put('/api/group',
	authenticate,
	async function (req,res,next){
		try{
			sendJson(req,res,
				await groupsToFull(
					await getGroups(
						[(await editGroup(req.body))]
					)
				)
			)
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

groupRouter.put('/api/join-group',
	authenticate,
	async function (req,res,next){
		try{
			await addGroupMember(req.body)
			sendJson(req,res,
				await groupsToFull(
					await getGroups([req.body.group_id])
				)
			)
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

groupRouter.put('/api/archive-group',
	authenticate,
	async function (req,res,next){
		try{
			// console.log(req.body)
			sendJson(req,res,
				await groupsToFull(
					await archiveGroup(req.body)
				)
			)
		}catch(err){
			console.error(err,req,res)
			next(err)
		}
	}
)

export default groupRouter