import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from "react-router-dom"; // ✅ import router
import "./index.css";
import AdminRegister from "./component/AdminRegister.jsx";
import Adminlogin from "./component/Adminlogin.jsx";
import DashBoard from "./component/DashBoard.jsx";
import ViewUser from "./component/ViewUser.jsx";
const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App/>}>
    <Route path="" element={<Adminlogin/>} />
    <Route path="/AdminRegister" element={<AdminRegister/>}/>
    <Route path="/dashboard" element={<DashBoard/>}/>
    <Route path="/viewuser/:id" element={<ViewUser/>}/>
  </Route>
  )
)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={Router}/>

  </React.StrictMode>
);
