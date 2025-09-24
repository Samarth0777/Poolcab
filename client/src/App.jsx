import { useState } from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './App.css'
import Login from './containers/Login/Login'
import Signup from './containers/Signup/Signup'
import Home from './containers/Home/Home'
import AppLayout from './AppLayout'
import Post from './containers/Post/Post'
import History from './containers/History/History'
import Profile from './containers/Profile/Profile'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Admin from './Admin/Admin'

function App() {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/signup',
      element: <Signup />,
    },
    {
      path:'/',
      element:<AppLayout/>,
      children:[
        {
          path:'/',
          element:<Home/>
        },
        {
          path:'/post',
          element:<Post/>
        },
        {
          path:'/history',
          element:<History/>
        },
        {
          path:'/profile',
          element:<Profile/>
        },
        {
          path:'/admin',
          element:<Admin/>
        }
      ]
    }
  ])


  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position='top-right' />
    </>
  )
}

export default App
