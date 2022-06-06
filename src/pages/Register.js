import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'
import { setDoc, doc, Timestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import defbg from '../components/items/bg3.jpg'

const Register = () => {
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        confirm_password: '',
        loading: false,
        err: null
    });
    const navigate = useNavigate();
    const { email, username, password, confirm_password, loading, err } = form;

    const navigateLogin = (e) => {
        e.preventDefault()
        navigate("/login")
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForm({ ...form, err: null, loading: true })
        if (password !== confirm_password) {
            setForm({ ...form, err: "Passwords do not match", loading: false })
            return;
        }
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            // console.log(res.user)
            await setDoc(doc(db, 'users', res.user.uid), {
                uid: res.user.uid,
                username,
                email,
                createdAt: Timestamp.fromDate(new Date()),
                isOnline: true,
                faceEnrollment: ""
            });
            setForm({ username: "", email: "", password: "", confirm_password: "", err: null, loading: false })
            console.log("success");
            navigate("/");

        } catch (galat) {
            setForm({ ...form, err: galat.message, loading: false })
            return;
        }
        setForm({ ...form, loading: false })
    }

    return (
        <div>
            <div className='w-0 h-screen fixed top-0 left-0 z-0'>
                <img className='opacity-30 min-h-max min-w-max ' src={defbg}></img>
            </div>
            <div className='flex items-center justify-center overflow-auto bg-gray-900'>
                <div className='flex text-white h-screen w-screen justify-center items-center'>
                    <div className='z-50 bg-gray-700 px-20 py-16 space-y-10 rounded-lg shadow-xl'>
                        <h3 className='text-4xl font-bold text-center'>
                            Register
                        </h3>
                        <form onSubmit={handleSubmit} className='space-y-2' autoComplete="none">
                            <div>
                                <label htmlFor='email' className='px-2'>Email</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 hover:border-opacity-70 hover:opacity-100 focus:opacity-100 focus:border-opacity-90 focus:bg-opacity-30 focus:bg-gray-800 bg-transparent outline-none w-full transition-all text-md'
                                    name="email"
                                    type="text"
                                    placeholder="E-mail"
                                    onChange={handleChange}
                                    autoComplete='none'
                                    required
                                />
                            </div>
                            <div>
                                <label className='px-2'>Username</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 hover:border-opacity-70 hover:opacity-100 focus:opacity-100 focus:border-opacity-90 focus:bg-opacity-30 focus:bg-gray-800 bg-transparent outline-none w-full transition-all text-md'
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    onChange={handleChange}
                                    autoComplete='none'
                                    required
                                />
                            </div>
                            <div>
                                <label className='px-2'>Password</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 hover:border-opacity-70 hover:opacity-100 focus:opacity-100 focus:border-opacity-90 focus:bg-opacity-30 focus:bg-gray-800 bg-transparent outline-none w-full transition-all text-md'
                                    name="password"
                                    type="password"
                                    placeholder="**********"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='px-2'>Confirm Password</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 hover:border-opacity-70 hover:opacity-100 focus:opacity-100 focus:border-opacity-90 focus:bg-opacity-30 focus:bg-gray-800 bg-transparent outline-none w-full transition-all text-md'
                                    name="confirm_password"
                                    type="password"
                                    placeholder="**********"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {err ? <p className='text-center text-red-500'>{err}</p> : null}
                            <div className='flex justify-center'>
                                <button className={`px-8 py-3 mt-4 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${loading ? "loading_dots" : ""}`} disabled={loading}>
                                    {/* <button className='px-5 py-2.5 border-2 border-gray-500 hover:bg-gray-500 hover:text-white transition-colors rounded-full mb-8 mt-8 disabled:opacity-50' disabled={loading}> */}
                                    {loading ? '••••••' : 'Register'}
                                </button>
                            </div>
                            <br/>
                            <div className='flex justify-center space-x-1 text-sm opacity-70'>
                                <p>Already have an account?</p>
                                <button className='border-b opacity-70 hover:opacity-100 transition-all outline-none disabled:opacity-50' onClick={navigateLogin} disabled={loading ? true : false}>
                                    Sign in
                                </button>
                                <p>instead</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register