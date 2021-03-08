import sgMail from '@sendgrid/mail'
import Cryptr from 'cryptr'
import {config} from 'dotenv'
config()

export const emailCryptr=new Cryptr(process.env.EMAIL_SECRET!)
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
export {sgMail}