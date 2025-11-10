
import { useEffect, useRef } from 'react'
import './App.css'
import { AuthProvider } from './net-fosterlink/backend/AuthContext'
import {apiUrl as apiUrlCfg} from "@/Config.json"
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './net-fosterlink/pages/Home'
import { Login } from './net-fosterlink/pages/Login'
import { Register } from './net-fosterlink/pages/Register'

function App() {

  const apiUrl = useRef<string>("http://localhost:8080/v1/")
  useEffect(() => {
    if (import.meta.env.MODE == "development") {
      if (import.meta.env.BASE_URL.includes("localhost")) {
        apiUrl.current = apiUrlCfg.dev
      } else {
        apiUrl.current = apiUrlCfg.staging
      }
    } else if (import.meta.env.MODE == "production") {
      apiUrl.current = apiUrlCfg.prod
    } else {
      apiUrl.current = apiUrlCfg.dev
    }
  })

  return (
    <>
        <BrowserRouter>
          <AuthProvider apiUrl={apiUrl.current}>
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
