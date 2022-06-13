import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import defbg from '../components/items/bg3.jpg'

// authentication context for firebase login. for updating things real time inside the website whenever the state changes 
// (there is/isn't a user currently logged in). a simple example is updating the navbar to show the user's profile pic when 
// there's a logged in user.
export const authContext = createContext()

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return (
            <div className='overflow-hidden z-0'>
                <div className='z-50 flex flex-col items-center justify-center overflow-auto bg-gray-900 h-screen w-screen'>
                    <h3 className='z-50 loading_dots text-white text-4xl'>
                        ••••••
                    </h3>
                </div>
                <div className='w-0 h-screen fixed top-0 left-0 z-0'>
                    <img className='opacity-30 min-h-max min-w-max ' src={defbg}></img>
                </div>
            </div>
        );
    }
    return <authContext.Provider value={{ user }}>{children}</authContext.Provider>
}

export default AuthProvider;