const redis=require("redis");
//we are creating a newClient here for simiplicity but sharing one is better
const {redisClient}=require("../db/redis");


const cacheData=async(req,res,next)=>{
    const userId=req.userId;
    const cacheKey=`${req.originalUrl}:${userId}`;

    try{
        const cachedData=await redisClient.get(cacheKey);

        if(cachedData){
            console.log(`CACHE HIT for key:${cacheKey}`);
            return res.json(JSON.parse(cachedData));
        }else{
            console.log(`CACHE MISS for key:${cacheKey}`);

            const originalSend=res.send.bind(res);
            res.send=(body)=>{
                redisClient.setEx(cacheKey,300,body);
                originalSend(body);
            }

            next();
        }
    }catch(error){
        console.error('Redis error:',error);
        next();
    }
}

module.exports={cacheData};