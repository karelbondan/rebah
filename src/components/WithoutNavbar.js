import React from 'react'
import { Outlet } from 'react-router-dom'

// exclude the navbar when a page uses this component
const WithoutNavbar = () => <Outlet />

export default WithoutNavbar