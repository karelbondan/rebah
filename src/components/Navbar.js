import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { updateDoc, doc, Timestamp, getDoc, onSnapshot } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import logo from '../components/items/rebah_logo_transparent.png'
import logo_2 from '../components/items/rebah_logo_complete_transparent.png'
import img from '../components/items/default.jpg'

const Navbar = () => {
    const [user, setUser] = useState()
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

    useEffect(() => {
        const set_user = async () => {
            if (auth.currentUser) {
                const usr = await getDoc(doc(db, 'users', auth.currentUser.uid))
                setUser(usr.data())
            } else {
                setUser("")
            }
        }
        set_user()
    }, [userExist])

    useEffect(() => {
        const updt = onSnapshot(doc(db, 'users', auth.currentUser.uid), snap => {
            setUser(snap.data())
        })
        return () => {updt()}
    }, [userExist])

    return (
        <nav className='flex items-center justify-between h-16 x-screen px-10 py-10 z-50 bg-slate-900 text-white'>
            <h3 className='z-50'>
                <Link to="/">
                    <img src={logo_2} className='h-[40px]' />
                </Link>
            </h3>
            <div className='z-50'>
                {userExist ?
                    <div className='space-x-2'>
                        <Link to={"/profile"}>
                            {user ? (
                                <div className='profile_container flex items-center space-x-3 opacity-80 hover:opacity-100 transition-all'>
                                    <p className='user_name text-lg transition-all'>{user.username}</p>
                                    <img src={user.avatar ? user.avatar : img} className='user_image h-11 w-11 rounded-full transition-all' />
                                </div>)
                                :
                                ""}
                        </Link>
                        {/* <button onClick={handleLogout}>Logout</button> */}
                    </div> :
                    <div className='space-x-2'>
                        {/* <Link to='/register'>Register</Link>
                        <Link to='/login'>Login</Link> */}
                    </div>
                }
            </div>
        </nav>
    )
}

export default Navbar