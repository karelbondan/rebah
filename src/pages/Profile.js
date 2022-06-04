import React, { useState, useEffect } from 'react'
import img from '../components/items/default.jpg'
import { storage, db, auth } from '../firebase';
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'
import { nodefluxAuth, nodefluxDeleteEnroll } from '../context/nodeflux';
import defbg from '../components/items/bg3.jpg'
import nodeflux_original from '../components/items/nodeflux_logo.png'
import nodeflux_white from '../components/items/nodeflux_logo_white.png'

const Profile = () => {
    const [loading, setLoading] = useState(false)
    const [useFaceMatch, setUseFaceMatch] = useState(false)
    const [pic, setPic] = useState("");
    const [user, setUser] = useState();
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({
        username: ""
    });
    const navigate = useNavigate();
    const { username } = form;

    useEffect(() => {
        let facematch_listener = onSnapshot(doc(db, 'users', auth.currentUser.uid), doc => {
            setUseFaceMatch(doc.data().faceEnrollment)
        })
        return () => facematch_listener()
    }, [])

    const doSomething = delay_amount_ms =>
        new Promise(resolve => setTimeout(() => resolve("delay"), delay_amount_ms))

    const loop_delete_enroll = async () => {
        // set loading to true here
        let status, result;
        let nodeflux_auth = await nodefluxAuth()
        while (['success', 'incompleted'].includes(status) !== true) {
            result = await nodefluxDeleteEnroll({ "auth_key": nodeflux_auth.auth_key, "timestamp": nodeflux_auth.timestamp })
            status = result.response.job.result.status
            await doSomething(1000)
            console.log("Returned status: " + status)
        }
        return result
    }

    const handleFooterButtons = async (e, todo = 'default') => {
        e.preventDefault()
        if (todo === "disable") {
            const disable_confirm = window.confirm("Are you sure you want to disable sign in using Face Match?")
            if (disable_confirm) {
                setLoading(true)
                const delete_result = await loop_delete_enroll()
                if (delete_result.response.job.result.status === 'incompleted') {
                    alert("Something happened during the deletion of the record data and resulted in failure. Please try again")
                } else {
                    alert("Sign in using Face Match has been successfully disabled. Feel free to enable it again at any time")
                }
                setLoading(false)
            }
        } else {
            navigate("/profile/facematch")
        }
    }

    const uploadIMG = () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'
        input.onchange = _this => {
            let files = Array.from(input.files)[0];
            setPic(files)
        };
        input.click();
    }

    const updatelocal = async () => {
        await getDoc(doc(db, 'users', auth.currentUser.uid)).then(docsnap => {
            if (docsnap.exists) {
                setUser(docsnap.data());
            }
        })
    }

    const delIMG = async () => {
        setLoading(true)
        try {
            const confirm = window.confirm("delete avatar?")
            if (confirm) {
                await deleteObject(ref(storage, user.avatarPath))
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    avatar: "",
                    avatarPath: ""
                })
                updatelocal()
            }
        } catch (galat) {
            console.log(galat.message)
        }
        setLoading(false)
    }

    const handleLogout = async () => {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            isOnline: false
        });
        await signOut(auth);
        console.log('logged out');
        navigate("/login");
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForm({ ...form, err: null, loading: true })
        try {
            console.log(username)
            if (username.length < 4) {
                alert("Username must be at least 6 characters long.")
            } else if (username.length > 15) {
                alert("Username cannot exceed 15 characters long.")
            } else {
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    username: username
                })
                await updatelocal()
                setEdit(false)
                setForm({ username: "" })
            }
        } catch (galat) {
            console.log(galat.message)
        }
    }

    const handleEdit = (e) => {
        e.preventDefault();
        edit ? setEdit(false) : setEdit(true)
        setForm({ username: "" })
    }

    useEffect(() => {
        updatelocal()
        if (pic) {
            const upl = async () => {
                setLoading(true)
                const imgref = ref(storage, `avatar/${new Date().getTime()} - ${pic.name}`)
                try {
                    if (user.avatarPath) {
                        await deleteObject(ref(storage, user.avatarPath))
                    }
                    const snap = await uploadBytes(imgref, pic)
                    const picurl = await getDownloadURL(ref(storage, snap.ref.fullPath))

                    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                        avatar: picurl,
                        avatarPath: snap.ref.fullPath
                    })
                    console.log(picurl)
                    setPic("")
                } catch (galat) {
                    console.log(galat.message)
                }
                setLoading(false)
            }
            upl()
        }
    }, [pic])
    return user ? (
        <div className='overflow-hidden'>
            <div className='w-0 h-screen left-0 top-0 z-0 fixed'>
                <img className='opacity-30 min-h-max min-w-max' src={defbg}></img>
            </div>
            <div className='flex items-center justify-center overflow-auto bg-gray-900 '>
                <div className='flex text-white h-screen w-screen justify-center items-center'>
                    <div className='z-50 bg-gray-700 px-10 py-10 space-y-6 rounded-lg shadow-xl'>
                        <div className='flex space-x-6'>
                            <div>
                                <img src={user.avatar ? user.avatar : img} alt='spyro' className='rounded-full w-80 h-80'></img>
                                <div className='flex justify-center mt-4 space-x-4'>
                                    <button title="Upload avatar" className={`px-8 py-3 rounded-full hover:bg-green-700 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""}`} onClick={uploadIMG}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </button>
                                    <button title="Delete avatar" className={`px-8 py-3 rounded-full hover:bg-red-700 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""}`} onClick={delIMG}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <button className={`loading_dots px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${loading ? "" : "hidden"}`} disabled={true}>
                                        ••••••
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className='flex items-center h-80'>
                                    <div className='px-2 space-y-4'>
                                        <div className='flex justify-center space-x-1'>
                                            <h3 className='text-5xl text-center font-bold py-3' hidden={edit ? true : false}>{user.username}</h3>
                                            <button title="Edit name" className='hover:bg-gray-800 rounded-full mt-2 h-12 px-4 transition-all focus:outline-none disabled:opacity-70' onClick={handleEdit} hidden={edit ? true : false} disabled={loading ? true : false}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <form hidden={edit ? false : true} className='space-y-2' autoComplete="off">
                                            <input
                                                className=' bg-gray-700 border-slate-400 text-5xl font-bold text-center focus:outline-none' name="username" type="text" maxLength="16" size="13" placeholder={user.username} onChange={handleChange} required
                                            />
                                            <div className='flex justify-center'>
                                                <button title="Confirm" className='hover:bg-gray-800 rounded-full px-4 py-2 transition-all focus:outline-none' onClick={handleSubmit} hidden={edit ? false : true}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button title="Discard" className='hover:bg-gray-800 rounded-full px-4 py-2 transition-all focus:outline-none' onClick={handleEdit} hidden={edit ? false : true}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </form>
                                        <h3 className='text-center text-lg'>{user.email}</h3>
                                    </div>
                                </div>
                                <div className='flex justify-center mt-4'>
                                    <button title="Sign out" className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70' onClick={handleLogout} disabled={loading ? true : false}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr className='my-4 opacity-30'></hr>
                        <div className={`text-center ${loading ? "" : "hidden"}`}>
                            <button className='hover:opacity-100 opacity-50 transition-all' disabled={true}>
                                <p>
                                    Please wait
                                    <br />
                                    <span className='flex items-center justify-center space-x-1 text-xs'>
                                        <span>Loading...</span>
                                    </span>
                                </p>
                            </button>
                        </div>
                        <div className={`footer_container ${loading ? "hidden" : ""}`}>
                            <div className={`text-center ${useFaceMatch ? "hidden" : ""}`}> {/*set hidden if have face enrollment*/}
                                <button className='hover:opacity-100 opacity-50 transition-all' onClick={handleFooterButtons}>
                                    <p>
                                        Enable sign in with Face Match
                                        <br />
                                        <span className='flex items-center justify-center space-x-1 text-xs'>
                                            <span>Powered by</span> <img className='height-nodeflux' src={nodeflux_white} />
                                        </span>
                                    </p>
                                </button>
                            </div>
                            <div className={`flex items-center justify-evenly text-center space-x-6 ${useFaceMatch ? "" : "hidden"}`}> {/*set hidden if not have face enrollment*/}
                                <button className='hover:opacity-100 opacity-50 transition-all' onClick={handleFooterButtons}>
                                    <p>
                                        Change Face Match model
                                        <br />
                                        <span className='flex items-center justify-center space-x-1 text-xs'>
                                            <span>Powered by</span> <img className='height-nodeflux' src={nodeflux_white} />
                                        </span>
                                    </p>
                                </button>
                                <button className='hover:opacity-100 hover:text-red-500 opacity-50 transition-all grayscale hover:grayscale-0' onClick={(e) => { handleFooterButtons(e, "disable") }}>
                                    <p>
                                        Disable sign in with Face Match
                                        <br />
                                        <span className='flex items-center justify-center space-x-1 text-xs'>
                                            <span>Powered by</span> <img className='height-nodeflux ' src={nodeflux_white} />
                                        </span>
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
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
    )
}

export default Profile