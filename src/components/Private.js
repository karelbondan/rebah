import React from 'react'
import { auth } from '../firebase'
import { Navigate } from 'react-router-dom'

// component for private pages
const Private = ({ children }) => {
    let userExist = auth.currentUser
    // if there's no user then prevent the guest from entering private pages.
    // example is the home page.
    if (!userExist) {
        return (
            <Navigate to={'/login'} replace />
        )
    } 
    return children;
}

export default Private

