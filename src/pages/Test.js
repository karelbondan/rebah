import React from 'react'
import defbg from '../components/items/bg3.jpg'

const Test = () => {
    // let a = "sadakjdlksajd"
    // let b = a.split('')
    // b.forEach(element => {
    //     console.log(element)
    // });

    let a = ""
    let c = [..."2mNMl8jSJvObSnNHWlnYhaHbzzj2"]
    c.forEach(element => {
        a = a + element.charCodeAt(0)
    });
    console.log(a)


    return (
        // <div className='bg-gray-500 text-white flex items-center justify-center'>
        //     test
        // </div>
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
    )
}

export default Test

{/* <div className='flex w-screen h-screen'>
                <div className='bg-gray-500 border border-red-500 text-white px-2 py-2'>
                    <div className='truncate'>
                        <p>aslkdjaskdjkadklsadkjaskdjaslkdjlkasdklakldjakldklasjdkkajdklajdklaskdjkaslldkl</p>

                    </div>
                </div>
                <div className='w-full bg-gray-700 text-white px-2 py-2'>
                    <div className='border-b border-white '>
                        Profile name
                    </div>
                    <div className='h-5/6 border'>
                        Message area
                    </div>
                    <div>
                        Send message area
                    </div>
                </div>
            </div> */}