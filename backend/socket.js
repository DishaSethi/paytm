const {Server}=require("socket.io");
const {jwtDecode}=require("jwt-decode");

const userSocketMap={};


const initializeSocket=(server,redisClient)=>{
    const io=new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST"],
        }
    });

const subscriber=redisClient.duplicate();
subscriber.connect();

subscriber.subscribe("notifications",(message)=>{
    console.log("Received message from Redis Pub/Sub",message);
    const {userId, message:notificationMessage}=JSON.parse(message);

    const recipientSocketId=userSocketMap[userId];
    if(recipientSocketId){
        io.to(recipientSocketId).emit("notification",{
            message:notificationMessage
        });
    }
});


    io.on("connection",(socket)=>{
        console.log("A user connected",socket.id);

        socket.on("register",(token)=>{
            try{
                const decodedToken=jwtDecode(token);
                const userId=decodedToken.userId;

                if(userId){
                    userSocketMap[userId]=socket.id;
                    console.log(`User ${userId} registered with socket ${socket.id}`);

                    socket.join(userId);
                }
            }catch(error){
                console.error("Invalid token during registration",error.message);
            }
        })
   

    socket.on("disconnect",()=>{
        for(const userId in userSocketMap){
            if(userSocketMap[userId]===socket.id){
                delete userSocketMap[userId];
                console.log(`User ${userId} disconnected and unregistered`);
                break;
            }
        }
        console.log("A user disconnected",socket.id);
    });
});
return {io,userSocketMap};

}

module.exports={initializeSocket};