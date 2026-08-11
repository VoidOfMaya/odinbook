import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Login } from './components/login.jsx'
import { GitLogin } from './components/gitlogin.jsx'


//page routing
const router = createBrowserRouter([
  {path:'/', element: <App />,
    children: [
      {path:'/', element: <Login />},
      {path:'/login/github', element: <GitLogin />}
    ],
    errorElement:<div>Page not found</div>
  },
])
//removed strict mode to test auth issues 
createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />  
)

