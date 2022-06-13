/* Write message area. This is the component where the upload and send buttons reside, and also the text message field */
import React from 'react'

const Message = ({ handleSubmit, text, setText, setImg, img, sending }) => {
    // handle image upload
    const uploadIMG = (e) => {
        // preventing the page from reloading
        e.preventDefault()
        // creating a new document input for the custom upload button
        let input = document.createElement('input');
        input.type = 'file';
        // the allowed file type is only images for now
        input.accept = 'image/*' 
        input.onchange = _this => {
            // get image from uploaded file
            let files = Array.from(input.files)[0];
            // regex for checking if the uploaded file is an image file
            if (/^image\/[\w]+$/.exec(files.type)) {
                // set "img" variable to uploaded image's base64 format
                setImg(files)
            } 
            // if regex doesn't find "image/..." in the string then alert user to upload image file type only
            else {
                alert("Please upload only image formatted file (JPG/PNG)")
                return
            }
        };
        // simulate on clicking the "upload" button
        input.click();
    }

    // handle removal of image attachment 
    const removeIMG = (e) => {
        e.preventDefault()
        setImg("")
    }

    // onKeyDown method on the textarea will call this function below 
    const handleEdit = (e) => {
        // enter a new line instead of send message if user press shift + enter
        if (e.shiftKey && e.keyCode === 13) {
            return
        } 
        // if press enter key then upload the message to the database
        else if (e.keyCode === 13) { 
            handleSubmit(e)
            // set the textarea to the default height
            const hadeh = document.getElementById("msg_write_area")
            hadeh.style.height = "";
        }
    }

    // onChange method on the textarea will call this function below
    const handleChange = (e) => {
        // if enter is pressed then do nothing
        if (e.keyCode === 13) {
            return
        } 
        // else set the "text" variable to the value of the textarea
        else {
            setText(e.target.value)
        }
        // set the textarea's height according to the number of lines it has
        const hadeh = document.getElementById("msg_write_area") // get the element
        hadeh.style.height = ""; // reset the height to nothing, doesn't change anything
        hadeh.style.height = `${Math.min(hadeh.scrollHeight, 384)}px`; // set the height to result of this calc
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
                    <textarea id='msg_write_area' className='w-full rounded-xl px-3 py-2 focus:outline-none bg-gray-700 text-gray-300' type='text' placeholder='Enter message' value={text} onChange={handleChange} onKeyDown={handleEdit} autoFocus />
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