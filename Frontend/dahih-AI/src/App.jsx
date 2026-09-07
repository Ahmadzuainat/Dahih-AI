import React from 'react'
import { BrowserRouter as Router, Routes, Route , Navigate } from 'react-router-dom'

// import files 
import Loginpage from './pages/Auth/LoginPage'
import Registerpage from './pages/Auth/RegisterPage'
import NotFound from './pages/NotFoundPage'
import Dashboradpage from './pages/Dashborad/Dashboradpage'
import DocumentlistPage from './pages/Documents/DocumentlistPage'
import ProfilePage from './pages/Profile/profilePage'
import DocumentDetailsPage from './pages/Documents/DocumentDetailsPage'
import ProtectedRoute from './Components/ProtectedRoute'
// Start App
function App() {
       const isAuthenticated = false; // Replace with your authentication logic
const loding = false; // Replace with your loading state logic
 if(loding) {
  return(
    <div className='flex justify-center items-center h-screen'>
        <div className=''>
          <p>Loding...</p>
        </div>
    </div>
  )
}
  
  return (
    <Router>
      <Routes>
          <Route path='/' element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Navigate to='/login' replace />} />
      <Route path='/login' element={<Loginpage />} />
      <Route path='/register' element={<Registerpage />} />
      {/* Protected Routes */}
       <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
       <Route path='/dashboard' element={<Dashboradpage />} />
       <Route path="/document" element={<DocumentlistPage />} />
       <Route path="/document/:id" element={<DocumentDetailsPage />} />
       <Route path="/profile" element={<ProfilePage />} />
       </Route>
      
      
      
      
      <Route path="*" element={<NotFound />} />
            </Routes>

    </Router>
  )
}

export default App
