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
import { AdminOnly } from './net-fosterlink/gateways/AdminOnly'
import { PendingFaqs } from './net-fosterlink/pages/PendingFaqs'
import { Agencies } from './net-fosterlink/pages/Agencies'
import { PendingAgencies } from './net-fosterlink/pages/PendingAgencies'
import { NotFound } from './net-fosterlink/pages/NotFound'
import { Banned } from './net-fosterlink/pages/Banned'
import { UserProfile } from './net-fosterlink/pages/UserProfile'
import { HiddenThreads } from './net-fosterlink/pages/HiddenThreads'
import { HiddenThreadLoader } from './net-fosterlink/pages/HiddenThreadLoader'
import { HiddenFaqs } from './net-fosterlink/pages/HiddenFaqs'
import { AccountDeletionRequests } from './net-fosterlink/pages/AccountDeletionRequests'
import { AccountSettings } from './net-fosterlink/pages/AccountSettings'
import { RestrictGateway } from './net-fosterlink/gateways/UnbannedOnly'
import { AdminUsers } from './net-fosterlink/pages/AdminUsers'
import { AdminUserFaqSuggestions } from './net-fosterlink/pages/AdminUserFaqSuggestions'
import { AdminUserFaqAnswers } from './net-fosterlink/pages/AdminUserFaqAnswers'
import { AdminUserAgencies } from './net-fosterlink/pages/AdminUserAgencies'
import { AdminUserReplies } from './net-fosterlink/pages/AdminUserReplies'
import { AdminUserThreads } from './net-fosterlink/pages/AdminUserThreads'
import { AuditLog } from './net-fosterlink/pages/AuditLog'
import { TokenAction } from './net-fosterlink/pages/TokenAction'
import { ForgotPassword } from './net-fosterlink/pages/ForgotPassword'
import { ResetPassword } from './net-fosterlink/pages/ResetPassword'
import { PrivacyPolicy } from './net-fosterlink/pages/PrivacyPolicy'
import { TermsOfService } from './net-fosterlink/pages/TermsOfService'
import { SwaggerProxy } from './net-fosterlink/pages/SwaggerProxy'
import { ConsentContextProvider } from './net-fosterlink/components/consent/ConsentContext'
import { CookieConsentBanner } from './net-fosterlink/components/consent/CookieConsentBanner'

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
        <ConsentContextProvider>
        <ThemeProvider>
        <BrowserRouter>
          <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
            <RestrictGateway>
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
              <Route path="/faq/hidden" element={<AdminOnly><HiddenFaqs/></AdminOnly>}/>
              <Route path="/agencies" element={<Agencies/>}/>
              <Route path="/agencies/pending" element={<AdminOnly><PendingAgencies/></AdminOnly>}/>
              <Route path="/admin/account-deletion-requests" element={<AdminOnly><AccountDeletionRequests/></AdminOnly>}/>
              <Route path="/admin/users" element={<AdminOnly><AdminUsers/></AdminOnly>}/>
              <Route path="/admin/users/:userId/faq-suggestions" element={<AdminOnly><AdminUserFaqSuggestions/></AdminOnly>}/>
              <Route path="/admin/users/:userId/faq-answers" element={<AdminOnly><AdminUserFaqAnswers/></AdminOnly>}/>
              <Route path="/admin/users/:userId/agencies" element={<AdminOnly><AdminUserAgencies/></AdminOnly>}/>
              <Route path="/admin/users/:userId/replies" element={<AdminOnly><AdminUserReplies/></AdminOnly>}/>
              <Route path="/admin/users/:userId/threads" element={<AdminOnly><AdminUserThreads/></AdminOnly>}/>
              <Route path="/admin/audit-log" element={<AdminOnly><AuditLog/></AdminOnly>}/>
              <Route path="/users/:userId" element={<UserProfile/>}/>
              <Route path="/settings" element={<AccountSettings/>}/>
              <Route path="/banned" element={<Banned/>}/>
              <Route path="/token-action" element={<TokenAction/>}/>
              <Route path="/forgot-password" element={<ForgotPassword/>}/>
              <Route path="/reset-password" element={<ResetPassword/>}/>
              <Route path="/privacy" element={<PrivacyPolicy/>}/>
              <Route path="/terms" element={<TermsOfService/>}/>
              <Route path="/dev/swagger" element={<AdminOnly><SwaggerProxy/></AdminOnly>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
            </RestrictGateway>
          </AuthProvider>
        </BrowserRouter>
          <CookieConsentBanner />
        </ThemeProvider>
        </ConsentContextProvider>
        <GlobalStyle/>
    </>
  )
}

export default App
