import React, { useEffect, useState } from 'react'
import defbg from '../components/items/bg3.jpg'
import { auth, db } from '../firebase'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { nodefluxAuth, nodefluxEnroll, nodefluxMatchEnroll, nodefluxDeleteEnroll, getPhotoID } from '../context/nodeflux'

const FaceMatch = () => {
    const [init, setInit] = useState(true)
    const [portrait, setPortrait] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [useVideo, setUseVideo] = useState(false)
    const [captured, setCaptured] = useState(false)
    const [videoElem, setVideoElem] = useState()
    const [capturedImg, setCapturedImg] = useState("")
    const [faceEnrollment, setFaceEnrollment] = useState(false)
    const [page, setPage] = useState({ page_1: true, page_2: false, page_3: false })
    const [pageJobDone, setPageJobDone] = useState({ page_1: false, page_2: false, page_3: false, })
    const [passedPage, setPassedPage] = useState({ page_2: false, page_3: false })

    const navigate = useNavigate()

    useEffect(() => {
        try {
            async function updateEnrollment() {
                const q = await getDoc(doc(db, 'users', auth.currentUser.uid))
                setFaceEnrollment(q.data().faceEnrollment)
            }
            updateEnrollment()
        } catch (e) {
            console.log(e)
        }
        const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), docsnap => {
            setFaceEnrollment(docsnap.data().faceEnrollment)
        })
        return () => { unsub() }
    }, [])

    useEffect(() => {
        setCaptured(captured && (!captured))
        setCapturedImg(capturedImg && (""))
        if (page.page_1) {
            setUseVideo(false)
            try {
                stopVideo()
            } catch (e) {
                // if error stopping video then just pass
            }
        } else if (page.page_2) {
            if (!useVideo) {
                setUseVideo(true)
            }
            try {
                stopVideo()
                startVideo()
            } catch (e) {
                // if user doesnt use video then it'll throw undefined 
                // error, so stopVideo is not called again
                startVideo()
            }
        }
    }, [page])

    useEffect(() => {
        setTimeout(() => {
            setInit(false)
        }, 1500);
    }, [])

    const abortEverything = (e) => {
        e.preventDefault()
        const confirm_abort = window.confirm("Are you sure you want to cancel the whole process? If you have passed the face enrollment process, you will be prompted to verify your face whenever you sign into Rebah next time. Proceed?")
        if (confirm_abort) {
            try {
                stopVideo()
            } catch (e) {
                // if error stopping video then just pass
            }
            navigate("/profile")
        }
    }

    const handleFinish = (e) => {
        e.preventDefault()
        stopVideo()
        navigate("/profile")
    }

    const handleSetPage = (currentPage) => {
        if (currentPage === 'page_1') {
            setPage({ page_1: true, page_2: false, page_3: false })
            setPassedPage({ page_2: false, page_3: false })
        } else if (currentPage === 'page_2') {
            if (pageJobDone.page_1) {
                setPage({ page_1: false, page_2: true, page_3: false })
                setPassedPage({ page_2: true, page_3: false })
            } else {
                alert("Please finish the Face Enrollment step first before moving on to the next step")
            }
        } else if (currentPage === 'page_3') {
            if (pageJobDone.page_1 && pageJobDone.page_2) {
                stopVideo()
                setPage({ page_1: false, page_2: false, page_3: true })
                setPassedPage({ page_2: true, page_3: true })
            } else {
                alert("Please finish the Face Enrollment and verification steps first before moving on to the next step")
            }
        }
    }

    const handleSetError = () => {
        setError("")
    }

    const startVideo = () => {
        let video;
        if (page.page_2) {
            video = document.getElementsByClassName('video_capture_page_2 max-h-80 w-fit rounded-lg')[0]
        } else {
            video = document.getElementsByClassName('video_capture_webcam max-h-72 w-fit rounded-lg')[0]
        }

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
        // i use array to store this because the video won't stop if I change 
        // pages. It is a logic thingy
        let video = [
            document.getElementsByClassName('video_capture_webcam max-h-72 w-fit rounded-lg')[0],
            document.getElementsByClassName('video_capture_page_2 max-h-80 w-fit rounded-lg')[0]
        ]
        /*
        try stop video in page 1 first, if fail then it means user is
        from page 2 to page 1, thus stop video page 1. but then when user goes from
        page 1 to 2 and vice versa the object not null, this is why there's 2 calls in each try 
        */
        try {
            video[0].srcObject.getTracks()[0].stop()
            video[1].srcObject.getTracks()[0].stop()
        } catch (e) {
            try {
                video[1].srcObject.getTracks()[0].stop()
                video[0].srcObject.getTracks()[0].stop()
            } catch (e) { 
                // if error stopping again then just pass
            }
        }
    }

    const uploadIMG = () => {
        let reader = new FileReader();
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg'
        input.onchange = _this => {
            setError("")
            let files = Array.from(input.files)[0];
            if (files.type !== 'image/jpeg') {
                alert("Please upload a proper JPEG/JPEG file")
                setError("Please upload a JPEG photo only.")
                return;
            }
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setPortrait(reader.result)
                    console.log(typeof portrait)
                }
            }
            reader.readAsDataURL(files)
        };
        input.click();
    }

    const handleUseVideo = () => {
        setUseVideo(!useVideo)
        if (!useVideo) {
            startVideo()
        } else {
            try {
                stopVideo()
            } catch (e) {
                console.log(e.message)
            }
        }
    }

    const handleCaptured = () => {
        setCaptured(!captured)
        setCapturedImg("")
        if (!captured) {
            let canvas = document.getElementsByClassName('video_capture_canvas h-72 rounded-lg')[0]
            let canvas_page_2 = document.getElementsByClassName('video_capture_canvas_page_2 h-80 rounded-lg')[0]
            // let vid_data = videoElem.getBoundingClientRect();
            canvas.getContext('2d').drawImage(videoElem, 0, 0, canvas.width, canvas.height)
            canvas_page_2.getContext('2d').drawImage(videoElem, 0, 0, canvas.width, canvas.height)
            setCapturedImg(page.page_2 ? canvas_page_2.toDataURL('image/jpeg') : canvas.toDataURL('image/jpeg'))
        }
    }

    const handleNodefluxEnroll = async () => {
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
                result = await nodefluxEnroll({
                    "auth_key": nodeflux_auth.auth_key,
                    "timestamp": nodeflux_auth.timestamp
                }, portrait && !useVideo ? portrait : capturedImg)
                status = result.response.job.result.status
                await doSomething(1000)
                console.log(status)
            }
            console.log(result) // DISABLE LATER
            if (result.response.message === "No face detected") {
                if (useVideo) {
                    alert("No face detected in the photo you submitted. If you haven't enabled your camera permission yet, please enable it. If you have, make sure that the camera lens is clean and your head is straight. Please look into the camera for best result too.")
                } else {
                    alert("No face detected in the photo you submitted. Please upload a photo with your face being shown clearly in the photo. Try to upload a non-blurry photo too to maximize the accuracy of the face matching verification.")
                }
            } else if (result.response.message === "Face Enrollment Success") {
                updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    faceEnrollment: true,
                    faceEnrollmentID: photo_id
                })
                alert("Face Enrollment succeeded! The verification process will begin afterwards.")
                setPageJobDone({ ...pageJobDone, page_1: true })
            } else {
                alert(result.response.message)
            }
            // set loading to false here
            return;
        }

        const loop_delete_enroll = async () => {
            // set loading to true here
            let status;
            let result;
            while (['success', 'incompleted'].includes(status) !== true) {
                result = await nodefluxDeleteEnroll({ "auth_key": nodeflux_auth.auth_key, "timestamp": nodeflux_auth.timestamp })
                status = result.response.job.result.status
                // status = result // CHANGE THIS LATER TO NORMAL, THIS IS FOR DEBUGGING ONLY
                await doSomething(1000)
                console.log("Returned status: " + status)
            }
            // console.log(result) // DISABLE LATER
            if (status === 'incompleted') {
                console.log(result)
                alert("something happened and we cannot delete your enrolled photo. please try again.\n message: " + result.response.message)
                return;
            } else {
                console.log("Face enrollment delete success, beginning new face enrollment process...")
            }
            status = undefined
            while (['success', 'incompleted'].includes(status) !== true) {
                result = await nodefluxEnroll({
                    "auth_key": nodeflux_auth.auth_key,
                    "timestamp": nodeflux_auth.timestamp
                }, portrait && !useVideo ? portrait : capturedImg)
                status = result.response.job.result.status
                await doSomething(1000)
                console.log("Returned status: " + status)
            }
            // console.log(result) // DISABLE LATER
            if (result.response.message === "No face detected") {
                if (useVideo) {
                    alert("No face detected in the photo you submitted. If you haven't enabled your camera permission yet, please enable it. If you have, make sure that the camera lens is clean and your head is straight. Please look into the camera for best result too.")
                } else {
                    alert("No face detected in the photo you submitted. Please upload a photo with your face being shown clearly in the photo. Try to upload a non-blurry photo too to maximize the accuracy of the face matching verification.")
                }
            } else if (result.response.message === "Face Enrollment Success") {
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    faceEnrollment: true,
                    faceEnrollmentID: photo_id
                })
                alert("Face Enrollment succeeded! The verification process will begin afterwards.")
                setPageJobDone({ ...pageJobDone, page_1: true })
            } else {
                alert(result.response.message)
            }
            // set loading to false here
            return;
        }

        if (faceEnrollment) {
            const confirmation = window.confirm(
                "You have added an enrollment face before. For security purposes, we only allow one enrollment per user. Do you want to proceed? If so, the existing enrollment will be deleted and replaced with this new one. Proceed?"
            )
            if (confirmation) {
                await loop_delete_enroll().then(() => console.log("New face enrollment success"))
            }
        } else {
            await loop().then(() => console.log("New face enrollment success"))
        }
        setLoading(false)
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
            console.log(result) // DISABLE LATER
            if (result.response.message === "No face detected") {
                alert("No face detected in the photo you submitted. Please upload a photo with your face being shown clearly in the photo. Try to upload a non-blurry photo too to maximize the accuracy of the face matching verification.")

            } else if (result.response.message === "Face Match Enrollment Success") {
                updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    faceEnrollment: true,
                    faceEnrollmentID: photo_id
                })
                alert("Face verification succeeded! You will be prompted to verify your identity by photo the next time you sign in into Rebah.")
                setPageJobDone({ ...pageJobDone, page_2: true })
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

    return init ? (
        <div className='overflow-hidden z-0'>
            <div className='z-50 flex flex-col items-center justify-center overflow-auto bg-gray-900 h-screen w-screen'>
                <h3 className='z-50 loading_dots text-white text-4xl'>
                    ••••••
                </h3>
                {/* <h3 className='text-white text-4xl'>
                    Loading
                </h3> */}
            </div>
            <div className='w-0 h-screen fixed top-0 left-0 z-0'>
                <img className='opacity-30 min-h-max min-w-max ' src={defbg}></img>
            </div>
        </div>
    ) : (
        <div className='overflow-hidden'>
            <div className='w-0 h-screen z-0 fixed'>
                <img className='opacity-30 left-0 top-0 min-h-max min-w-max' src={defbg}></img>
            </div>
            <div className='flex items-center justify-center overflow-auto bg-gray-900'>
                <div className='flex text-white h-screen w-screen justify-center items-center'>
                    <div className='z-50 bg-gray-700 px-10 py-10 space-y-6 rounded-lg shadow-xl'>
                        {/* header */}
                        <div className='-space-y-9'>
                            <div className='text-right'>
                                <button className='hover:bg-gray-800 rounded-full px-2 py-2 transition-all focus:outline-none' onClick={abortEverything}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className='header flex items-center justify-center -space-x-1'>
                                {/* preventing inf loop in onClick func (i dont grasp the basic yet but without the arrow func it's basically infinite loop) */}
                                <div title='Upload photo' className='bg-slate-400 border-4 border-slate-400 rounded-full h-6 w-6 cursor-pointer z-20' onClick={() => { handleSetPage('page_1') }}></div>
                                <div className={`${passedPage.page_2 ? "bg-slate-400" : "bg-white"} w-24 h-1 z-10`}></div>
                                <div title='Verification test' className={`${passedPage.page_2 ? "bg-slate-400 " : "bg-white"} rounded-full h-6 w-6 cursor-pointer z-20`} onClick={() => { handleSetPage('page_2') }}></div>
                                <div className={`${passedPage.page_3 ? "bg-slate-400" : "bg-white"} w-24 h-1 z-10`}></div>
                                <div title='Finalization' className={`${passedPage.page_3 ? "bg-slate-400 " : "bg-white"} rounded-full h-6 w-6 cursor-pointer z-20`} onClick={() => { handleSetPage('page_3') }}></div>
                                {/* <div className='bg-white w-24 h-1 z-10'></div>
                            <div className='bg-white rounded-full h-6 w-6 cursor-pointer z-20'></div> */}
                            </div>
                        </div>
                        {/* body */}
                        <div className='body_container'>
                            {/* page 1*/}
                            <div className={`${page.page_1 ? "h-[580px] flex" : "hidden"}`}>
                                {/* page 1 - upload photo*/}
                                <div className={`page_1 flex flex-col items-center justify-center space-y-9 ${useVideo ? "hidden" : ""}`}>
                                    <div className='text-center space-y-4'>
                                        <h3 className='text-4xl font-bold'>Upload your image</h3>
                                        <p>
                                            Upload your portrait photo. It will be used as the base image for verifying your face when signing in.
                                            <br />
                                            The photo must be in JPG/JPEG format with a max file size of 800 KB and a max resolution of 2000 x 2000 pixels.
                                        </p>
                                    </div>
                                    <div className={`${portrait ? "max-h-72 w-fit" : "h-72 w-72 bg-slate-600 rounded-xl"} flex items-center justify-center`}>
                                        {portrait ?
                                            <img className='h-72 max-h-72 max-w-2xl rounded-lg' src={portrait} />
                                            :
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        }
                                    </div>
                                    <div className={`flex space-x-2 ${error ? "text-red-400" : "hidden"}`}>
                                        <button title='Dismiss' className='text-slate-500 hover:bg-slate-600 transition-all' onClick={handleSetError}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p>{error}</p>
                                    </div>
                                    <div className='flex flex-col justify-center items-center space-y-4'>
                                        <div className='space-x-2'>
                                            {/* set hidden after user clicks "upload to server" button */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""} ${pageJobDone.page_1 ? "hidden" : ""}`} onClick={uploadIMG}>
                                                Select image
                                            </button>
                                            {/* set hidden after successfull face enrollment on nodeflux */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${portrait ? "" : "hidden"} ${loading ? "loading_dots" : ""} ${pageJobDone.page_1 ? "hidden" : ""}`} disabled={loading ? true : false} onClick={handleNodefluxEnroll}>
                                                {`${loading ? "••••••" : "Upload to server"}`}
                                            </button>
                                            {/* set hidden if response from nodeflux not ok */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${pageJobDone.page_1 ? "" : "hidden"}`} onClick={() => { handleSetPage("page_2") }}>
                                                Next
                                            </button>
                                        </div>
                                        <button className='opacity-50 border-b border-b-transparent hover:opacity-100 hover:border-b-current transition-all disabled:opacity-20' disabled={loading ? true : false} onClick={handleUseVideo}>
                                            Use camera instead
                                        </button>
                                    </div>
                                </div>
                                {/* page 1 - use camera */}
                                <div className={`page_1 flex flex-col items-center justify-center space-y-9 ${useVideo ? "" : "hidden"}`}>
                                    <div className='text-center space-y-4'>
                                        <h3 className='text-4xl font-bold'>Say cheese!</h3>
                                        <p>
                                            Use your camera and take a photo.
                                            <br />
                                            Make sure to hold your head straight and look straight into the camera for best result.
                                        </p>
                                    </div>
                                    <div className={`${useVideo ? "h-72 max-h-72 w-fit" : "h-72 w-[500px]"} bg-slate-600 rounded-xl flex items-center justify-center`}>
                                        <div className={`${captured ? "hidden" : ""}`}> {/* if captured then set to hidden and stop stream */}
                                            <video muted autoPlay className='video_capture_webcam max-h-72 w-fit rounded-lg' />
                                        </div>
                                        <div className={`${captured ? "" : "hidden"}`}> {/* if captured then set to not hidden */}
                                            <canvas className='video_capture_canvas rounded-lg h-72'></canvas>
                                        </div>
                                    </div>
                                    <div className={`flex space-x-2 ${error ? "text-red-400" : "hidden"}`}>
                                        <button title='Dismiss' className='text-slate-500 hover:bg-slate-600 transition-all' onClick={handleSetError}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p>{error}</p>
                                    </div>
                                    <div className='flex flex-col justify-center items-center space-y-4'>
                                        <div className='space-x-2'>
                                            {/* set hidden after user clicks "upload to server" button */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""} ${pageJobDone.page_1 ? "hidden" : ""}`} onClick={handleCaptured}>
                                                {captured ? "Re-capture photo" : "Capture photo"}
                                            </button>
                                            {/* set hidden after successfull face enrollment on nodeflux */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${capturedImg ? "" : "hidden"} ${loading ? "loading_dots" : ""} ${pageJobDone.page_1 ? "hidden" : ""}`} disabled={loading ? true : false} onClick={handleNodefluxEnroll}>
                                                {`${loading ? "••••••" : "Upload to server"}`}
                                            </button>
                                            {/* set hidden if response from nodeflux not ok */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${pageJobDone.page_1 ? "" : "hidden"}`} onClick={() => { handleSetPage("page_2") }}>
                                                Next
                                            </button>
                                        </div>
                                        <button className='opacity-50 border-b border-b-transparent hover:opacity-100 hover:border-b-current transition-all disabled:opacity-20' disabled={loading ? true : false} onClick={handleUseVideo}>
                                            Upload a photo instead
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* page 2*/}
                            <div className={`${page.page_2 ? "h-[580px] flex" : "hidden"}`}>
                                <div className='page_1 flex flex-col items-center justify-center space-y-10'>
                                    <div className='text-center space-y-4'>
                                        <h3 className='text-4xl font-bold'>Verification test</h3>
                                        <p>
                                            Success! Your portrait has been recorded in the database.
                                            <br />
                                            Now, ready yourself, give your best smile, and press the "Capture Photo" button when you're ready.
                                        </p>
                                    </div>
                                    <div className={`${useVideo ? "h-80 max-h-80 w-fit" : "h-80 w-[500px]"} bg-slate-600 rounded-xl flex items-center justify-center`}>
                                        <div className={`${captured ? "hidden" : ""}`}> {/* if captured then set to hidden and stop stream */}
                                            <video muted autoPlay className='video_capture_page_2 max-h-80 w-fit rounded-lg' />
                                        </div>
                                        <div className={`${captured ? "" : "hidden"}`}> {/* if captured then set to not hidden */}
                                            <canvas className='video_capture_canvas_page_2 rounded-lg h-80'></canvas>
                                        </div>
                                    </div>
                                    <div className={`flex space-x-2 ${error ? "text-red-400" : "hidden"}`}>
                                        <button title='Dismiss' className='text-slate-500 hover:bg-slate-600 transition-all' onClick={handleSetError}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p>{error}</p>
                                    </div>
                                    <div className='flex flex-col justify-center items-center space-y-4'>
                                        <div className='space-x-2'>
                                            {/* set hidden after user clicks "upload to server" button */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${loading ? "hidden" : ""} ${pageJobDone.page_2 ? "hidden" : ""}`} onClick={handleCaptured}>
                                                {captured ? "Re-capture photo" : "Capture photo"}
                                            </button>
                                            {/* set hidden after successfull face enrollment on nodeflux */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none disabled:opacity-70 ${capturedImg ? "" : "hidden"} ${loading ? "loading_dots" : ""} ${pageJobDone.page_2 ? "hidden" : ""}`} disabled={loading ? true : false} onClick={handleNodefluxFaceMatchEnroll}>
                                                {`${loading ? "••••••" : "Verify my identity"}`}
                                            </button>
                                            {/* set hidden if response from nodeflux not ok */}
                                            <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${pageJobDone.page_2 ? "" : "hidden"}`} onClick={() => { handleSetPage("page_3") }}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* page 3*/}
                            <div className={`${page.page_3 ? "h-[580px] flex flex-col" : "hidden"}`}>
                                <div className='flex flex-col items-center pt-20 text-center space-y-10 px-7'>
                                    <div className='flex justify-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[150px] w-[150px]" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className='space-y-4'>
                                        <h3 className='text-4xl font-bold'>Verification test complete</h3>
                                        <p>
                                            Success! You have successfully enabled sign in with face recognition.
                                            <br />
                                            You will be prompted to verify your face whenever you're signing in for the next time
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center justify-center mt-20'>
                                    <button className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none' onClick={handleFinish}>
                                        Finish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FaceMatch