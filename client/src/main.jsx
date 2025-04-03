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
import AuthLayout from './Layout/AuthLayout.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Layer />}>
//       <Route path='' element={<Home />} />
//       <Route path='about' element={<About />} />
//       <Route path='contract' element={<Contact />} />
//       <Route path='github' 
//       element={<GitHub />} 
//       loader = {Gitinfo}
//       />
//       <Route path='user/:userid' element={<User />}  />
//     </Route>
//   )
// )
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//   <RouterProvider  router={router}  />
//   </React.StrictMode>,
// )

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App/>}>
       <Route path="home" element={<Home />}>
        <Route path=":userId" element={<Message />} />
      </Route>
      <Route path='register' element=
      {<AuthLayout>
      <Register/>
      </AuthLayout>
      } />
      <Route path='' element ={
        <AuthLayout>
        <CheckEmail/></AuthLayout>} />
      <Route path='checkpassword' element={<AuthLayout><CheckPassword/></AuthLayout>} />
    </Route>
  
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
