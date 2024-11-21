import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generateToken = (id)=> {
    return jwt.sign({id} ,"124" , {
        expiresIn: "40d"
    })
}

export default generateToken

