import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'
import { updateDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

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
            <div className='flex flex-1 w-screen h-screen justify-center items-center'>
                <div>
                    <div className='bg-gray-200 rounded-3xl px-16 py-2 shadow-xl text-gray-700 border-gray-300 border'>
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <h3 className='text-2xl border-b border-black py-3 mt-8 mb-8 font-bold'>Login to your account</h3>
                            <div>
                                <label htmlFor='email' className='px-2 font-bold'>Email</label>
                                <input
                                    className='rounded-md mb-5 mt-1 px-3 h-10 border-2 border-slate-400 w-full'
                                    name="email"
                                    type="text"
                                    placeholder="E-mail"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className='px-2 font-bold'>Password</label>
                                <input
                                    className='rounded-md mb-5 mt-1 px-3 h-10 border-2 border-slate-400 w-full'
                                    name="password"
                                    type="text"
                                    placeholder="**********"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {err ? <p className='text-center text-red-500'>{err}</p> : null}
                            <div className='flex justify-center'>
                                <button className='px-5 py-2.5 border-2 border-gray-500 hover:bg-gray-500 hover:text-white transition-colors rounded-full mb-8 mt-8 disabled:opacity-50' disabled={loading}>
                                    {loading ? 'Logging in ...' : 'Login'}
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