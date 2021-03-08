import {Request,Response} from 'express'
import {StatusCodes} from 'http-status-codes'

export function sendJson(req:Request,res:Response,data:any,status=StatusCodes.OK){
	res.status(status).json({data,token: req.token?.accessToken})
}