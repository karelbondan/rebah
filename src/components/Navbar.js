import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import logo_2 from '../components/items/rebah_logo_complete_transparent.png'
import img from '../components/items/default.jpg'

const Navbar = () => {
    const [user, setUser] = useState()
    const [previousAuthState, setPreviousAuthState] = useState()
    const [userExist, setUserExist] = useState()

    // update the userExist var and user data whenever user logs in/logs out
    onAuthStateChanged(auth, () => {
        setUserExist(auth.currentUser)
        // if there's a user then set the "user" var to the current user else set it empty
        const set_user = async () => {
            console.log("you're called")
            if (auth.currentUser) {
                const usr = await getDoc(doc(db, 'users', auth.currentUser.uid))
                setUser(usr.data())
            } else {
                setUser("")
            }
        }
        // sometimes this method is called although user is not logging out/in. 
        // therefore there is a check if the previous data is the same as the current one, 
        // the function won't be called to save resources (prevent reaching firebase quota
        // limit basically)
        if (userExist !== previousAuthState) {
            set_user()
        }
        setPreviousAuthState(userExist)
    })

    // update the profile pic in the navbar when user changes profile pic
    useEffect(() => {
        // will be undefined when there's no user, hence the try catch
        try {
            const updt = onSnapshot(doc(db, 'users', auth.currentUser.uid), snap => {
                setUser(snap.data())
            })
            return () => { updt() }
        } catch (e) { }
    }, [])

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