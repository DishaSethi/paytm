const redis=require("redis");

const redisClient=redis.createClient({
    url:process.env.REDIS_URL,
    socket:{
        keepAlive:5000,
        reconnectStrategy:retries=> Math.min(retries*50,1000)
    }
});

redisClient.on("error",(err)=>console.log('Redis Client Error',err));

const connectRedis=async()=>{
    if(!redisClient.isOpen){
        await redisClient.connect();
        console.log("Connected to Redis successfully!");
    }
};

module.exports={redisClient,connectRedis};