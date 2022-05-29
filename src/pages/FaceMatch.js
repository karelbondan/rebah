import React, { useEffect, useState } from 'react'
import defbg from '../components/items/bg3.jpg'
import { auth } from '../firebase'

const FaceMatch = () => {
    const [portrait, setPortrait] = useState("")
    const [error, setError] = useState("")
    const [useVideo, setUseVideo] = useState(false)
    const [captured, setCaptured] = useState(false)
    const [videoElem, setVideoElem] = useState()
    const [capturedImg, setCapturedImg] = useState("")

    const handleSetError = () => {
        setError("")
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
            let vid_data = videoElem.getBoundingClientRect();
            canvas.getContext('2d').drawImage(videoElem, 0, 0, canvas.width, canvas.height)
            console.log(vid_data.width, vid_data.height)
            setCapturedImg(canvas.toDataURL('image/jpeg'))

        }
    }

    const handleNodefluxEnroll = async () => {
        // request for token
        
        await fetch("https://cors-anywhere.herokuapp.com/https://backend.cloud.nodeflux.io/auth/signatures", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                "access_key": "TSJZ7GNB091Y1MAFH1CYW2DPF",
                "secret_key": "fyM801LrkAaIuVEDtawR669jehxlgrs70NU43Z0yk6FPufnGv9AD9RM9-wUeVs-k"
            }
        }).then(authorization => {
            // console.log(authorization.json())
            let key = `NODEFLUX-HMAC-SHA256 Credential=${"ACCESSKEY"}/${"DATE"}/nodeflux.api.v1beta1.ImageAnalytic/StreamImageAnalytic, SignedHeaders=x-nodeflux-timestamp, Signature=${"TOKEN"}`
        }).catch(e => { console.log(e.message) })
    }

    const startVideo = () => {
        navigator.getUserMedia({ video: true }, stream => {
            let video = document.getElementsByClassName('video_capture_webcam max-h-72 w-fit rounded-lg')[0]
            if (video) {
                video.srcObject = stream
            }
            setVideoElem(video)
        }, err => {
            console.log(err.message)
        })
    }

    const stopVideo = () => {
        let video = document.getElementsByClassName('video_capture_webcam max-h-72 w-fit rounded-lg')[0]
        video.srcObject.getTracks()[0].stop()
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
                }
            }
            reader.readAsDataURL(files)
        };
        input.click();
    }

    return (
        <div className='overflow-hidden'>
            <div className='w-0 h-screen z-0 fixed'>
                <img className='opacity-30 left-0 top-0 min-h-max min-w-max' src={defbg}></img>
            </div>
            <div className='flex items-center justify-center overflow-auto bg-gray-900'>
                <div className='flex text-white h-screen w-screen justify-center items-center'>
                    <div className='z-50 bg-gray-700 px-10 py-10 space-y-6 rounded-lg shadow-xl'>
                        <div className='header flex items-center justify-center -space-x-1'>
                            {/* header */}
                            <div title='Upload photo' className='bg-slate-400 border-4 border-slate-400 rounded-full h-6 w-6 cursor-pointer z-20'></div>
                            <div className='bg-slate-400 w-24 h-1 z-10'></div>
                            <div title='Verification test' className='bg-slate-400 rounded-full h-6 w-6 cursor-pointer z-20'></div>
                            <div className='bg-white w-24 h-1 z-10'></div>
                            <div title='Finalization' className='bg-white rounded-full h-6 w-6 cursor-pointer z-20'></div>
                            <div className='bg-white w-24 h-1 z-10'></div>
                            <div className='bg-white rounded-full h-6 w-6 cursor-pointer z-20'></div>
                        </div>
                        <div className='body_container border-yellow-500'>
                            {/* body */}
                            {/* page 1 - upload photo*/}
                            <div className={`page_1 flex flex-col items-center justify-center space-y-8 ${useVideo ? "hidden" : ""}`}>
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
                                        <img className='max-h-72 max-w-2xl rounded-lg' src={portrait} />
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
                                        <button className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none' onClick={uploadIMG}>
                                            Select image
                                        </button>
                                        {/* set hidden after successfull face enrollment on nodeflux */}
                                        <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${portrait ? "" : "hidden"}`} onClick={handleNodefluxEnroll}>
                                            Upload to server
                                        </button>
                                        {/* set hidden if response from nodeflux not ok */}
                                        <button className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none hidden'>
                                            Next
                                        </button>
                                    </div>
                                    <button className='opacity-50 border-b border-b-transparent hover:opacity-100 hover:border-b-current transition-all' onClick={handleUseVideo}>
                                        Use camera instead
                                    </button>
                                </div>
                            </div>
                            {/* page 1 - use camera */}
                            <div className={`page_1 flex flex-col items-center justify-center space-y-8 ${useVideo ? "" : "hidden"}`}>
                                <div className='text-center space-y-4'>
                                    <h3 className='text-4xl font-bold'>Say cheese!</h3>
                                    <p>
                                        Use your camera and take a photo.
                                        <br />
                                        Make sure to hold your head straight and look straight into the camera for best result.
                                    </p>
                                </div>
                                <div className={`${useVideo ? "max-h-72 w-fit" : "h-72 w-[500px]"} bg-slate-600 rounded-xl flex items-center justify-center`}>
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
                                        <button className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none' onClick={handleCaptured}>
                                            {captured ? "Re-capture photo" : "Capture photo"}
                                        </button>
                                        {/* set hidden after successfull face enrollment on nodeflux */}
                                        <button className={`px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none ${capturedImg ? "" : "hidden"}`} onClick={handleNodefluxEnroll}>
                                            Upload to server
                                        </button>
                                        {/* set hidden if response from nodeflux not ok */}
                                        <button className='px-8 py-3 rounded-full hover:bg-gray-800 bg-gray-600 transition-all focus:outline-none hidden'>
                                            Next
                                        </button>
                                    </div>
                                    <button className='opacity-50 border-b border-b-transparent hover:opacity-100 hover:border-b-current transition-all' onClick={handleUseVideo}>
                                        Upload a photo instead
                                    </button>
                                </div>
                            </div>
                            <div className='page_2 hidden'>
                                body 2
                            </div>
                            <div className='page_3 hidden'>
                                body 3
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FaceMatch