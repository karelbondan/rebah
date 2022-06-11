import React, { useEffect, useState } from 'react'
import defbg from '../components/items/bg3.jpg'
// import { db } from '../firebase'
// import { addDoc, collection } from 'firebase/firestore'
import { nodefluxAuth, nodefluxMatchEnroll } from '../context/nodeflux'

const Test = () => {
    // let a = "sadakjdlksajd"
    // let b = a.split('')
    // b.forEach(element => {
    //     console.log(element)
    // });

    const [image, setImage] = useState("")

    let a = ""
    let c = [..."2mNMl8jSJvObSnNHWlnYhaHbzzj2"]
    c.forEach(element => {
        a = a + element.charCodeAt(0)
    });
    console.log(a)

    // const test_upl = async () => {
    //     await addDoc(collection(db, 'folders'), {
    //         name: "test_folder"
    //     })
    // }

    // useEffect(() => {
    //     test_upl()
    // }, [])

    useEffect(() => {
        const func = async () => {
            await fetch()
        }
        async function test_func() {
            await fetch()
        }
        func()
    }, [])

    const handleNodeflux = async () => {
        const auth = await nodefluxAuth()
        const doSomething = delay_amount_ms =>
            new Promise(resolve => setTimeout(() => resolve("delay"), delay_amount_ms))
        const match_loop = async () => {
            let status, result;
            while (['success, incompleted'].includes(status) !== true) {
                result = await nodefluxMatchEnroll({
                    "auth_key": auth.auth_key,
                    "timestamp": auth.timestamp
                }, image)
                status = result.response.job.result.status
                await doSomething(1000)
                console.log(status)
                console.log(result)
            }
        }
        await match_loop().then(console.log("kinda successful ig lmao"))
    }

    const handleClick = (e) => {
        e.preventDefault()
        // NO
    }

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
                <div className='z-50'>
                    {/* <input type='file'></input> */}
                    <button className='px-6 py-6 rounded-full bg-black text-white z-50' onClick={handleClick}>Upload image</button>
                    <button className='px-6 py-6 rounded-full bg-black text-white z-50' onClick={handleNodeflux} disabled={image ? false : true}>Check verification</button>
                </div>
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