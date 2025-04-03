// import React, { useEffect, useState } from "react";
// // import { FaUserAstronaut } from "react-icons/fa";
// import axios from 'axios';
// import toast from "react-hot-toast";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import Avatar from "../component/Avatar";
// const CheckPassword  = () => {
//   const [password,setPassword] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   // console.log("location",location.state)
//     const data = location.state;
//     const usseid = data?._id;
//     console.log(usseid)
//   useEffect(()=>{
//     if(!data?.name){
//       navigate("/checkEmail");
//     }
//   },[])

//   const handleSubmit = async (e) => {

//     const urls = "http://localhost:3000/api/user/password";
//     e.preventDefault();
//     e.stopPropagation();  
//     try {
//       console.log('====================================');
//       console.log(password);
//       console.log('====================================');
//       const response = await axios.post(urls, { password, userid: usseid }, { withCredentials: true });

//       toast.success(response.data.message)
//       if(response.data.success){
//     console.log('====================================');
//     console.log("hello");
//     console.log('====================================');
//         navigate("/")
//         setPassword("");       
       
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message)
//       console.log(error);
//     }
//   };
//   return (
// <>
//     <form
//       onSubmit={handleSubmit}
//       className="grid gap-4 mt-5 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
//     >
//       <h2 className="text-2xl font-bold text-center mb-4">check password</h2>
// <div className="w-full flex justify-center items-center">
// {/* <FaUserAstronaut style={{ width: 100, height: 100, color: "#00ADB5" }}/> */}
// <Avatar 
// name={data?.name}
// profile_pic={data?.profile_pic}
// width={100}
// height={100}
// />
// </div>
   

//       {/* Email Field */}
//       <div className="flex flex-col gap-1">
//         <label htmlFor="email" className="font-medium">
//           Password :
//         </label>
//         <input
//           type="password"
//           id="email"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Enter your password"
//           className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
//           required
//         />
//       </div>


//       {/* Register Button */}
//       <button
//         type="submit"
//         className="w-full bg-blue-500 text-lg px-4 py-2 hover:bg-blue-600 rounded-md mt-4 font-semibold text-white transition-all"
//       >
//          Login
//       </button>
//     </form>
//               <p className='my-3 text-center'>New User ? <Link to={"/register"} className='hover:text-primary font-semibold'>Register</Link></p>
// </>
//   );
// }

// export default CheckPassword 

import React, { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../component/Avatar";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/UserSlice";

const CheckPassword = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const userId = data?._id; 
  const dispatch = useDispatch();

  useEffect(() => {
    if (!data?.name) {
      navigate("/checkEmail");
    }
  }, [data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();  

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/password",
        { password, userid: userId },
        { withCredentials: true } 
      );

      toast.success(response.data.message);
      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem("token",response?.data?.token);
        navigate("/home");
        setPassword("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 mt-5 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Check Password</h2>

        <div className="w-full flex justify-center items-center">
          <Avatar name={data?.name} profile_pic={data?.profile_pic} width={100} height={100} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-lg px-4 py-2 hover:bg-blue-600 rounded-md mt-4 font-semibold text-white transition-all"
        >
          Login
        </button>
      </form>
      <p className='my-3 text-center'>
        New User? <Link to={"/register"} className='hover:text-primary font-semibold'>Register</Link>
      </p>
    </>
  );
};

export default CheckPassword;
