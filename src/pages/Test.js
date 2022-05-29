import React from 'react'

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
        <div>
            <div className='flex w-screen h-screen'>
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
            </div>
        </div>
    )
}

export default Test