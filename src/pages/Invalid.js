import React from 'react'
import defbg from '../components/items/bg3.jpg'
import { useNavigate } from 'react-router-dom'

const Invalid = () => {
    const navigate = useNavigate()
    const navigateMe = (e) => {
        e.preventDefault()
        navigate("/")
    }
    return (
        <div className='overflow-hidden z-0'>
            <div className='z-50 flex flex-col items-center justify-center overflow-auto bg-gray-900 h-screen w-screen space-y-10'>
                <div className='z-50'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[150px] w-[150px]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className='z-50 text-center space-y-2'>
                    <h3 className='z-50 text-white text-4xl'>
                        Welcome to the infamous <strong>404 Not Found</strong>
                    </h3>
                    <p className='z-50 text-white text-lg'>
                        There's nothing here, let's go home
                    </p>
                </div>
                <div className='z-50'>
                <button className='text-lg take_me_home opacity-50 border-b border-b-transparent hover:opacity-100 hover:border-b-current transition-all disabled:opacity-20' onClick={navigateMe}>
                        Take me home~
                    </button>
                </div>
                {/* <h3 className='text-white text-4xl'>
                    Loading
                </h3> */}
            </div>
            <div className='w-0 h-screen fixed top-0 left-0 z-0'>
                <img className='opacity-30 min-h-max min-w-max ' src={defbg}></img>
            </div>
        </div>
    )
}

export default Invalid