import React from 'react'
import Header from './common/Header'
import Footer from './common/Footer'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';

function Rootlayout() {
  return (
    <div>
       <AuthProvider>
        <Header/>
                <div style={{minHeight:'76vh'}}>
                    <Outlet/>
                </div>
        <Footer/>
       </AuthProvider>
        
    </div>
  )
}

export default Rootlayout