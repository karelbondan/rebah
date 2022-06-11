import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase'
import { updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { nodefluxAuth, nodefluxMatchEnroll, getPhotoID } from '../context/nodeflux';
import defbg from '../components/items/bg3.jpg'

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        // loading: false,
        err: null
    })
    const [captured, setCaptured] = useState(false)
    const [capturedImg, setCapturedImg] = useState("")
    const [videoElem, setVideoElem] = useState()
    const [pageJobDone, setPageJobDone] = useState(false)
    const [hasFaceMatch, setHasFaceMatch] = useState(false)
    const [loading, setLoading] = useState(false)
    const { email, password, err } = form;
    const navigate = useNavigate();

    useEffect(() => {
        const login_check = async () => {
            try {
                setLoading(true)
                setForm({ ...form, err: null })
                // console.log(auth.currentUser)
                if (auth.currentUser) {
                    const current_user = await getDoc(doc(db, 'users', auth.currentUser.uid))
                    if (current_user.data().faceEnrollment && !current_user.data().hasVerifiedSignIn) {
                        setHasFaceMatch(true)
                    }
                }
                setLoading(false)
            } catch (e) { }
        }
        login_check()
    }, [])

    useEffect(() => {
        if (hasFaceMatch) {
            startVideo()
        } else {
            try {
                stopVideo()
            } catch (e) { }
        }
    }, [hasFaceMatch])

    const handleSignOutNotMe = async (e) => {
        e.preventDefault()
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            isOnline: false,
            lastSeen: Timestamp.fromDate(new Date()),
            hasVerifiedSignIn: false
        })
        await signOut(auth)
        setHasFaceMatch(false)
        try {
            stopVideo()
        } catch (e) { }
        document.getElementById("reset_all").click()
    }

    const navigateRegister = (e) => {
        e.preventDefault()
        try {
            stopVideo()
        } catch (e) { }
        navigate("/register")
    }

    const startVideo = () => {
        const video = document.getElementsByClassName('video_capture_page_2 max-h-80 w-fit rounded-lg')[0]
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((mediaStream) => {
                video.srcObject = mediaStream;
                video.onloadedmetadata = (e) => {
                    video.play();
                };
                setVideoElem(video)
            })
            .catch((err) => {
                console.log(err.name + ": " + err.message);
                if (err.name === "NotReadableError" && err.message === "Could not start video source") {
                    alert("Another application is blocking access to your camera, kindly close or disable the app temporarily and click the \"Use upload photo instead\" button below, then press the \"Use camera instead\"button again.")
                } else {
                    alert("Something is blocking access to your camera, make sure you've enabled the permission and/or use the photo upload feature instead. Do keep in mind that a camera will be needed when you're using the Face Match feature when signing in.")
                }
            });
    }

    const stopVideo = () => {
        const video = document.getElementsByClassName('video_capture_page_2 max-h-80 w-fit rounded-lg')[0]
        /*
        try stop video in page 1 first, if fail then it means user is
        from page 2 to page 1, thus stop video page 1. but then when user goes from
        page 1 to 2 and vice versa the object not null, this is why there's 2 calls in each try 
        */
        try {
            video.srcObject.getTracks()[0].stop()
        } catch (e) {
            // if error stopping then just pass
        }
    }

    const handleCaptured = () => {
        setCaptured(!captured)
        setCapturedImg("")
        if (!captured) {
            let canvas = document.getElementsByClassName('video_capture_canvas_page_2 rounded-lg h-80')[0]
            let video = videoElem.getBoundingClientRect()
            canvas.width = video.width
            canvas.height = video.height
            canvas.getContext('2d').drawImage(videoElem, 0, 0, canvas.width, canvas.height)
            setCapturedImg(canvas.toDataURL('image/jpeg'))
        }
    }

    const handleNodefluxFaceMatchEnroll = async () => {
        setLoading(true)
        let nodeflux_auth = await nodefluxAuth()
        // getting the decimal representation of current user id
        const photo_id = getPhotoID(auth.currentUser.uid)

        const doSomething = delay_amount_ms =>
            new Promise(resolve => setTimeout(() => resolve("delay"), delay_amount_ms))

        const loop = async () => {
            // set loading to true here
            let status;
            let result;
            while (['success', 'incompleted'].includes(status) !== true) {
                result = await nodefluxMatchEnroll({
                    "auth_key": nodeflux_auth.auth_key,
                    "timestamp": nodeflux_auth.timestamp
                }, capturedImg)
                status = result.response.job.result.status
                await doSomething(1000)
                console.log("Returned status: " + status)
            }
            // console.log(result) // DISABLE LATER
            if (result.response.message === "No face detected") {
                alert("No face detected in the photo you submitted. Please upload a photo with your face being shown clearly in the photo. Try to upload a non-blurry photo too to maximize the accuracy of the face matching verification.")

            } else if (result.response.message === "Face Match Enrollment Success") {
                updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    faceEnrollment: true,
                    faceEnrollmentID: photo_id
                })
                alert("Face verification succeeded. Enjoy your stay in Rebah!")
                setPageJobDone(true)
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    hasVerifiedSignIn: true
                })
                try {
                    stopVideo()
                } catch (e) { }
                navigate("/")
            } else {
                alert(result.response.message)
            }
            // set loading to false here
            return;
        }

        await loop().then(() => {
            console.log('Face match verification succeeded')
        })
        setLoading(false)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFinish = (e) => {
        e.preventDefault()
        try {
            stopVideo()
        } catch (e) { }
        navigate("/")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setForm({ email: "", password: "", err: null, loading: true })
        setLoading(true)
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            await updateDoc(doc(db, 'users', res.user.uid), {
                isOnline: true,
                lastSeen: ""
            });
            setLoading(false)
            // setForm({ email: "", password: "", err: null, loading: false })
            console.log("success");

            // DO CHECKING IF USER HAS FACE MATCH HERE BEFORE NAVIGATING TO HOME PAGE
            const current_user = await getDoc(doc(db, 'users', auth.currentUser.uid))
            if (current_user.data().faceEnrollment && !current_user.data().hasVerifiedSignIn) {
                setHasFaceMatch(true)
            } else {
                navigate("/");
            }

        } catch (galat) {
            setLoading(false)
            // setForm({ ...form, err: galat.message, loading: false })
            setForm({ ...form, err: galat.message })
            return;
        }
        // setForm({ ...form, loading: false })
        setLoading(false)
    }

    return (
        <div>
            <div className='w-0 h-screen fixed top-0 left-0 z-0'>
                <img className='opacity-30 min-h-max min-w-max ' src={defbg}></img>
            </div>
            <div className='flex items-center justify-center overflow-auto bg-gray-900'>
                <div className='flex text-white h-screen w-screen justify-center items-center'>
                    <div className='z-50 bg-gray-700 px-20 py-14 rounded-lg shadow-xl'>
                        <div className={`space-y-10 ${hasFaceMatch ? "hidden" : ""}`}> {/* set hidden when doing face verification (if user enables it) */}
                            <h3 className='text-4xl font-bold text-center'>
                                Sign in
                            </h3>
                            <form onSubmit={handleSubmit} className='space-y-2' autoComplete="off">
                                <input id='reset_all' type="reset" className='hidden' />
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
                                    <label className='px-2'>Password</label>
                                    <input
                                        className='rounded-full mb-5 mt-1 px-4 h-10 border border-white border-opacity-60 opacity-70 hover:border-opacity-70 hover:opacity-100 focus:opacity-100 focus:border-opacity-90 focus:bg-opacity-30 focus:bg-gray-800 bg-transparent outline-none w-full transition-all text-md'
                                        name="password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {err ? <p className='text-center text-red-500'>{err}</p> : null}
                                <div className='flex justify-center'>
                                    <button className={`px-8 py-3 mt-4 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${loading ? "loading_dots" : ""}`} disabled={loading}>
                                        {loading ? '••••••' : 'Login'}
                                    </button>
                                </div>
                                <br />
                                <div className='flex justify-center space-x-1 text-sm opacity-70'>
                                    <p>Don't have an account?</p>
                                    <button className='border-b opacity-70 hover:opacity-100 transition-all outline-none disabled:opacity-50' onClick={navigateRegister} disabled={loading ? true : false}>
                                        Register
                                    </button>
                                    <p>instead</p>
                                </div>
                            </form>
                        </div>
                        <div className={`${hasFaceMatch ? "" : "hidden"}`}> {/* set not hidden when doing face verification (if user enables it) */}
                            <div className='flex flex-col items-center justify-center space-y-10 min-w-[450px]'>
                                <div className='text-center space-y-4'>
                                    <h3 className='text-4xl font-bold'>Identity verification</h3>
                                    <p>
                                        You have enabled sign in using Face Match.
                                        <br />
                                        Please verify your identity before continuing to use Rebah
                                    </p>
                                </div>
                                <div className={`h-80 max-h-80 w-fit bg-slate-600 rounded-xl flex items-center justify-center`}>
                                    <div className={`${captured ? "hidden" : ""}`}> {/* if captured then set to hidden and stop stream */}
                                        <video muted autoPlay className='video_capture_page_2 max-h-80 w-fit rounded-lg' />
                                    </div>
                                    <div className={`${captured ? "" : "hidden"}`}> {/* if captured then set to not hidden */}
                                        <canvas className='video_capture_canvas_page_2 rounded-lg h-80'></canvas>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center items-center space-y-4'>
                                    <div className='space-x-2'>
                                        {/* set hidden after user clicks "upload to server" button */}
                                        <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""} ${pageJobDone ? "hidden" : ""}`} onClick={handleCaptured}>
                                            {captured ? "Re-capture photo" : "Capture photo"}
                                        </button>
                                        {/* set hidden after successfull face enrollment on nodeflux */}
                                        <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${capturedImg ? "" : "hidden"} ${loading ? "loading_dots" : ""} ${pageJobDone ? "hidden" : ""}`} disabled={loading ? true : false} onClick={handleNodefluxFaceMatchEnroll}>
                                            {`${loading ? "••••••" : "Verify my identity"}`}
                                        </button>
                                        {/* set hidden if response from nodeflux not ok */}
                                        <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${pageJobDone ? "" : "hidden"}`} onClick={handleFinish}> {/* onClick={() => { handleSetPage("page_3") }} */}
                                            Finish
                                        </button>
                                    </div>
                                    {loading ?
                                        <div className='flex justify-center space-x-1 text-sm opacity-70 border-b border-b-transparent'>
                                            Loading... don't close this tab or your browser
                                        </div>
                                        :
                                        pageJobDone ?
                                            <div className='flex justify-center space-x-1 text-sm opacity-70 border-b border-b-transparent'>
                                                Verification process finished. Click the button above to go to your dashboard
                                            </div>
                                            :
                                            <div className='flex justify-center space-x-1 text-sm opacity-70'>
                                                <p>Not {auth.currentUser ? auth.currentUser.email : "placeholder@email.com"}?</p>
                                                <button className='border-b opacity-70 hover:opacity-100 transition-all outline-none disabled:opacity-50' onClick={handleSignOutNotMe} disabled={pageJobDone ? true : false || loading ? true : false}>
                                                    Sign out
                                                </button>
                                                <p>and sign in again using your account</p>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login