import jwt from "jsonwebtoken";

export default function(req, res, next){
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({msg: "Access Denied. No Token Provided."});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }catch(err){
        res.status(400).json({msg: "Invalid Token. Please Log In Again."});
    }
};