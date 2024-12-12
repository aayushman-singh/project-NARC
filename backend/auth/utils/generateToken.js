import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generateToken = (id)=> {
    return jwt.sign({id} ,"1234" , {
        expiresIn: "12d"
    })
}

export default generateToken

