import React from 'react'

const Message = ({ handleSubmit, text, setText, setImg, img, sending }) => {
    const uploadIMG = (e) => {
        e.preventDefault()
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'
        input.onchange = _this => {
            let files = Array.from(input.files)[0];
            if (files.type !== 'image/jpg' || files.type !== 'image/jpeg' || files.type !== 'image/png') {
                alert("Please upload only image formatted file (JPG/PNG)")
                return
            }
            setImg(files)
            console.log(files)
            console.log(files.size * 2 ** -10)
        };
        input.click();
    }

    const removeIMG = (e) => {
        e.preventDefault()
        setImg("")
    }

    const handleEdit = (e) => {
        if (e.shiftKey && e.keyCode === 13) {
            return
        } else if (e.keyCode === 13) {
            handleSubmit(e)
            const hadeh = document.getElementById("msg_write_area")
            hadeh.style.height = "";
        }
    }

    const handleChange = (e) => {
        if (e.keyCode === 13) {
            return
        } else {
            setText(e.target.value)
        }
        const hadeh = document.getElementById("msg_write_area")
        hadeh.style.height = "";
        hadeh.style.height = `${Math.min(hadeh.scrollHeight, 384)}px`;
    }

    return (
        <div className='px-5 py-5 space-y-5 bg-gray-800'>
            <div hidden={img || sending ? false : true}>
                <div className={`text-center ${sending ? "" : "hidden"}`}>
                    <p className='take_me_home opacity-50 text-gray-400'>Sending...</p>
                </div>
                <div className='flex text-gray-500 space-x-5' >
                    <button onClick={removeIMG} hidden={img ? false : true}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h3 className='text-gray-400' hidden={img ? false : true}>
                        {`Attached: ${img.name}`}
                    </h3>
                </div>
            </div>
            <div className='flex space-x-5 w-full'>
                <button className='buton text-gray-500' onClick={uploadIMG}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <form className='flex space-x-5 justify-center w-full'>
                    {/* <input className='w-full rounded-xl px-3 py-2 focus:outline-none bg-gray-700 text-gray-300' type='text' placeholder='Enter message' value={text} onChange={(e) => { setText(e.target.value) }}></input> */}
                    <textarea id='msg_write_area' className='w-full rounded-xl px-3 py-2 focus:outline-none bg-gray-700 text-gray-300' type='text' placeholder='Enter message' value={text} onChange={handleChange} onKeyDown={handleEdit} />
                    <button className='text-gray-500' onClick={handleSubmit}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Message