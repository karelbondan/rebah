import React from 'react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { updateDoc, doc, Timestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    let userExist = auth.currentUser
    const navigate = useNavigate();
    const handleLogout = async () => {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            isOnline: false,
            lastSeen: Timestamp.fromDate(new Date())
        });
        await signOut(auth);
        console.log('logged out');
        navigate("/login");
    }

    onAuthStateChanged(auth, () => {
        userExist = auth.currentUser
    })

    return (
        <nav className='flex items-center justify-between h-16 x-screen px-20 z-50 bg-slate-900 text-white'>
            <h3 className='z-50'>
                <Link to="/">Messenger</Link>
            </h3>
            <div className='z-50'>
                {userExist ?
                    <div className='space-x-2'>
                        <Link to={"/profile"}>Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </div> :
                    <div className='space-x-2'>
                        <Link to='/register'>Register</Link>
                        <Link to='/login'>Login</Link>
                    </div>
                }
            </div>
        </nav>
    )
}

export default Navbar