
import { useEffect } from "react";
import { useState } from "react";
import './Dashboard.css';
import { useNavigate } from "react-router-dom";

const Dashboard=()=>{
    const [users,setUsers]=useState([]);
    const [loading,setLoading]=useState(true);
    const [balance, setBalance]=useState(null);
    const navigate=useNavigate();

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
        const fetchUsers=async()=>{
            try{
                const token=sessionStorage.getItem("token");
                const res=await fetch("http://localhost:3000/api/v1/user/bulk",
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
                setUsers(data.user);
                

            }catch(err){
                console.log("Error fetching users",err);
            }finally{
                setLoading(false);
            }


        }
        fetchUsers();
    },[])
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

        </div>


    )

}
export default Dashboard;