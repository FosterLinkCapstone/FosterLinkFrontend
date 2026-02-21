import './App.css'
import { ThemeProvider } from './ThemeProvider'
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
import { Agencies } from './net-fosterlink/pages/Agencies'
import { PendingAgencies } from './net-fosterlink/pages/PendingAgencies'
import { NotFound } from './net-fosterlink/pages/NotFound'
import { UserProfile } from './net-fosterlink/pages/UserProfile'
import { HiddenThreads } from './net-fosterlink/pages/HiddenThreads'
import { HiddenThreadLoader } from './net-fosterlink/pages/HiddenThreadLoader'

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
        <ThemeProvider>
        <BrowserRouter>
          <AuthProvider apiUrl={import.meta.env.VITE_API_URL} mapsApiKey={import.meta.env.VITE_MAPS_API_KEY}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/threads" element={<Threads/>}/>
              <Route path="/threads/thread/:threadId" element={<ThreadLoader preloadedThread={undefined}/>}></Route>
              <Route path="/threads/hidden" element={<AdminOnly><HiddenThreads/></AdminOnly>}/>
              <Route path="/threads/hidden/thread/:threadId" element={<AdminOnly><HiddenThreadLoader/></AdminOnly>}/>
              <Route path="/faq" element={<FaqHome/>}/>
              <Route path="/faq/pending" element={<AdminOnly><PendingFaqs/></AdminOnly>}/>
              <Route path="/agencies" element={<Agencies/>}/>
              <Route path="/agencies/pending" element={<AdminOnly><PendingAgencies/></AdminOnly>}/>
              <Route path="/users/:userId" element={<UserProfile/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        </ThemeProvider>
        <GlobalStyle/>
    </>
  )
}

export default App
