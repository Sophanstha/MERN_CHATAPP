import React from 'react'
import { Outlet } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';


const App = () => {
  return (
    <>
<Toaster />
    <Outlet/>
  </>
  )
}

export default App