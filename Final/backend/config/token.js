import jwt from "jsonwebtoken"
export const generateToken =  (id)=>{
    let Token = jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"})
    return Token
  
}
