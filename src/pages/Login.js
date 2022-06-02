import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'
import { updateDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import defbg from '../components/items/bg3.jpg'

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        loading: false,
        err: null
    });

    const navigate = useNavigate();

    const { email, password, loading, err } = form;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForm({ ...form, err: null, loading: true })
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            await updateDoc(doc(db, 'users', res.user.uid), {
                isOnline: true
            });
            setForm({ email: "", password: "", err: null, loading: false })
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
                            Sign in
                        </h3>
                        <form onSubmit={handleSubmit} className='space-y-2' autoComplete="off">
                            <div>
                                <label htmlFor='email' className='px-2'>Email</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 focus:opacity-100 focus:border-opacity-90 bg-transparent outline-none w-full transition-all text-md'
                                    name="email"
                                    type="text"
                                    placeholder="E-mail"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className='px-2'>Password</label>
                                <input
                                    className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 focus:opacity-100 focus:border-opacity-90 bg-transparent outline-none w-full transition-all text-md'
                                    name="password"
                                    type="password"
                                    placeholder="**********"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {err ? <p className='text-center text-red-500'>{err}</p> : null}
                            <div className='flex justify-center'>
                                <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${loading ? "loading_dots" : ""}`} disabled={loading}>
                                    {loading ? '••••••' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login