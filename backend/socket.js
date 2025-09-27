const {Server}=require("socket.io");
const {jwtDecode}=require("jwt-decode");

// const userSocketMap={};


const initializeSocket=(server,redisClient)=>{
    const io=new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST"],
        }
    });

const subscriber=redisClient.duplicate();
subscriber.on('error',(err)=>console.error('Redis Subscriber Error',err));
subscriber.connect();

subscriber.subscribe("notifications",(message)=>{
    try{
        console.log("Received message from Redis Pub/Sub",message);
        const {userId, message:notificationMessage}=JSON.parse(message);

    // const recipientSocketId=userSocketMap[userId];
    // if(recipientSocketId){
        io.to(String(userId)).emit("notification",{
            message:notificationMessage
        });
    }catch(err){
        console.error("Error processing Redis  pub/sub message",err);
    }
});


    io.on("connection",(socket)=>{
        console.log("A user connected",socket.id);

        socket.on("register",async (token)=>{
            try{
                const decodedToken=jwtDecode(token);
                const userId=decodedToken.userId;

                if(userId){
                    // userSocketMap[userId]=socket.id;
                    socket.userId=userId;

                    const redisKey=`user:${userId}:socketId`;
                    await redisClient.set(redisKey,socket.id);


                    socket.join(String(userId));
                    console.log(`User ${userId} registered with socket ${socket.id}`);

                }
            }catch(error){
                console.error("Invalid token during registration",error.message);
            }
        })
   

    socket.on("disconnect",async ()=>{
        // for(const userId in userSocketMap){
        //     if(userSocketMap[userId]===socket.id){
        //         delete userSocketMap[userId];
        //         console.log(`User ${userId} disconnected and unregistered`);
        //         break;
        //     }
        // }
        console.log("A user disconnected",socket.id);
        if(socket.userId){  
            const redisKey=`user:${socket.userId}:socketId`;
            await redisClient.del(redisKey);
            console.log(`Cleaned up Redis key for User ${socket.userId}`);
        }
    });
});
return {io};

}

module.exports={initializeSocket};