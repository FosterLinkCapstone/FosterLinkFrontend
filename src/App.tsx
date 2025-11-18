import './App.css'
import { AuthProvider } from './net-fosterlink/backend/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './net-fosterlink/pages/Home'
import { Login } from './net-fosterlink/pages/Login'
import { Register } from './net-fosterlink/pages/Register'

function App() {

  /*const apiUrl = useMemo(() => {
      if (import.meta.env.MODE == "development") {
      if (import.meta.env.BASE_URL.includes("localhost")) {
        return apiUrlCfg.dev
      } else {
        return apiUrlCfg.staging
      }
      } else if (import.meta.env.MODE == "production") {
        return apiUrlCfg.prod
      } else {
        return apiUrlCfg.dev
      }
  }, [])*/
  

  return (
    <>
        <BrowserRouter>
          <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
    </>
  )
}

export default App
