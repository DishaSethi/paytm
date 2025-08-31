
import { useEffect } from "react";
import { useState } from "react";
import './Dashboard.css';
import { useNavigate } from "react-router-dom";

const Dashboard=()=>{
    const [users,setUsers]=useState([]);
    const [loading,setLoading]=useState(true);
    const [balance, setBalance]=useState(null);
    const [page,setPage]=useState(1);
     const [hasMore, setHasMore] = useState(true);
    const navigate=useNavigate();
    const USERS_PER_PAGE = 3; 

    useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = sessionStorage.getItem("token"); // get token from session storage
        if (!token) {
          console.error("No token found in session storage");
          return;
        }

        const res = await fetch("http://localhost:3000/api/v1/account/balance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  // ✅ attach token here
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch balance");
        }

        const data = await res.json();
        setBalance(data.balance); // assuming API sends { balance: 100 }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBalance();
  }, []);


     

  

    useEffect(()=>{
        const fetchUsers=async(pageNum=1)=>{
            try{
                const token=sessionStorage.getItem("token");
                const res=await fetch(`http://localhost:3000/api/v1/user/bulk?page=${pageNum}&limit=${USERS_PER_PAGE}`,
                   {
                       method:"GET",
                       headers:{
                           "Content-Type":"application/json",
                           "Authorization": `Bearer ${token}`

                    },
                    credentials:"include",
            })

                if(!res.ok){
                    throw new Error("Failed to fetch users");
                }

                const data=await res.json();
                if (data.user.length < USERS_PER_PAGE) setHasMore(false)
                    // setUsers((prev)=>[...prev,...data.user]);
                if (pageNum === 1) {
    setUsers(data.user); 
} else {
    setUsers((prev) => [...prev, ...data.user]); 
}
            }catch(err){
                console.log("Error fetching users",err);
            }finally{
                setLoading(false);
            }


        }
        fetchUsers(page);
    },[page])
    if(loading){
        return <div>Loading...</div>


    }

    return(
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                User Dashboard 
            </h1>
            <p className="balance">Current Balance:{balance!=null?`${balance}`:"Loading"}</p>
            <div className="users-list">
                {users.length>0 ?(
                    users.map((user)=>(
                        <div key={user._id} className="user-row">
                            <div className="user-avatar">
                                {user.firstName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <p className="user-name">{user.firstName} {user.lastName}</p>
                                <p className="user-email">{user.email}</p>
                            </div>
                            <button className="send-btn" onClick={() => navigate(`/send/${user._id}`)}>Send Money</button>

                        </div>
                    )

                )): <p className="no-users" >No users found</p>
                }
            </div>
            {hasMore &&(
                <button onClick={()=>setPage((prev)=>prev+1)}> Load More</button>
            )}

        </div>


    )

}
export default Dashboard;