import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Login } from './components/login.jsx'
import { GitLogin } from './components/gitlogin.jsx'
import { FeedPage } from './pages/feed-page/feed-page.jsx'
import { WelcomePage } from './pages/welcome-page/welcome.jsx'


//page routing
const router = createBrowserRouter([
  {path:'/', element: <App />,
    children: [
      {path: '/', element: <WelcomePage />},
      {path:'/feed', element: <Login />},
      {path:'/profile', element: <FeedPage/>},
      {path:'/search', element: <Login />},
      {path:'/login/github', element: <GitLogin />}
    ],
    errorElement:<div>Page not found</div>
  },
])
//removed strict mode to test auth issues 
createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />  
)

