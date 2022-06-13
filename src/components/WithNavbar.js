import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// include the navbar when a page uses this component
const WithNavbar = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export default WithNavbar