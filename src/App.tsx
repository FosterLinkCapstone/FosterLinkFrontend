import './App.css'
import { AuthProvider } from './net-fosterlink/backend/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './net-fosterlink/pages/Home'
import { Login } from './net-fosterlink/pages/Login'
import { Register } from './net-fosterlink/pages/Register'
import { Threads } from './net-fosterlink/pages/Threads'
import { createGlobalStyle } from 'styled-components'
import { ThreadLoader } from './net-fosterlink/pages/ThreadLoader'
import { FaqHome } from './net-fosterlink/pages/FaqHome'
import { AdminOnly } from './net-fosterlink/pages/AdminOnly'
import { PendingFaqs } from './net-fosterlink/pages/PendingFaqs'

function App() {

  const GlobalStyle = createGlobalStyle`
    #root {
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
    }
  `

  return (
    <>
        <BrowserRouter>
          <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/threads" element={<Threads/>}/>
              <Route path="/threads/thread/:threadId" element={<ThreadLoader preloadedThread={undefined}/>}></Route>
              <Route path="/faq" element={<FaqHome/>}/>
              <Route path="/faq/pending" element={<AdminOnly><PendingFaqs/></AdminOnly>}/>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <GlobalStyle/>
    </>
  )
}

export default App
