import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import CheckEmail from './pages/CheckEmail.jsx'
import CheckPassword from './pages/CheckPassword.jsx'
import Message from './component/Message.jsx'
import GroupMessage from './component/GroupMessage.jsx'
import AiMessage from './component/AiMessage.jsx'
import AuthLayout from './Layout/AuthLayout.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import axios from 'axios'

// Automatically attach Bearer token and credentials to all outgoing API calls
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.withCredentials = true;
  return config;
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App/>}>
       <Route path="home" element={<Home />}>
        <Route path="ai" element={<AiMessage />} />
        <Route path=":userId" element={<Message />} />
        <Route path="group/:groupId" element={<GroupMessage />} />
      </Route>
      <Route path='register' element=
      {<AuthLayout>
      <Register/>
      </AuthLayout>
      } />
      <Route path='' element ={
        <AuthLayout>
        <CheckEmail/></AuthLayout>} />
      <Route path='checkEmail' element ={
        <AuthLayout>
        <CheckEmail/></AuthLayout>} />
      <Route path='checkemail' element ={
        <AuthLayout>
        <CheckEmail/></AuthLayout>} />
      <Route path='checkpassword' element={<AuthLayout><CheckPassword/></AuthLayout>} />
    </Route>
  
  )
)

import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router}/>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
