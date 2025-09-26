import Signin from "./components/Signin";
import Signup from "./components/Signup"
import Dashboard1 from "./components/Dashboard1";
import SendPage from "./components/SendPage";
import Send from "./components/Send";
import TransactionPage from "./components/TransactionPage";
import BudgetPage from "./components/BudgetPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

function App() {

  return (
  <>
        <Toaster
        position="top-center"
        reverseOrder={false}
      />
  <Router>
  <Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/dashboard" element={<Dashboard1/>}/>
    <Route path="/sendpage" element={<SendPage/>}/>

    <Route path="/send/:id" element={<Send/>}/>
    <Route path="/transactionpage" element={<TransactionPage/>}/>
    <Route path="/budgetpage" element={<BudgetPage/>}/>


    {/* <Route path/> */}
  

  </Routes>
  
  </Router>
  </>
  )
}

export default App;
