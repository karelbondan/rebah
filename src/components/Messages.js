import React, { useEffect, useState } from 'react'
import Moment from 'react-moment'

const Messages = ({ message, user1 }) => {
    const [edit, setEdit] = useState(false);
    const [text, setText] = useState("")

    useEffect(() => {

    }, [text])

    useEffect(() => {
        setText(message.text)
    }, [message])

    const handleChange = (e) => {
        setText(e.target.value)
        const hadeh = document.getElementById("textarea")
        hadeh.style.height = "";
        hadeh.style.height = `${Math.min(hadeh.scrollHeight, 384)}px`;
    }

    const changeEditState = (e) => {
        e.preventDefault()
        setEdit(true)
    }

    const handleEdit = (e, keycode = null) => {
        // console.log(e.keyCode)
        if (e.keyCode === 27 || keycode === 27) {
            setEdit(false)
            setText(message.text)
        }
        else if (e.keyCode === 13 || keycode === 13) {
            console.log("submit edit")
        }
        // update message in firebase
    }

    const handleDelete = (e) => {
        e.preventDefault()
        // delete message from firebase, need to get and set id in doc first
    }

    return (
        <div className={`all_messages_container flex rounded-2xl mb-2 ${message.from === user1 ? `text-right ${edit ? "" : "justify-end"} items-center space-x-3` : ""} hover:bg-black hover:bg-opacity-20`}>
            <div className={`menu_container space-x-2 ${message.from === user1 ? "" : "hidden"} ${edit ? "hidden" : ""}`}>
                <button title='Edit message' onClick={changeEditState}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button title='Delete message' onClick={handleDelete}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div className={`${edit ? "w-full" : "max-w-3xl"} ${message.from === user1 ? " bg-purple-400 inline-block rounded-2xl px-4 py-2 text-white" : "bg-gray-800 inline-block text-white rounded-2xl px-4 py-2"}`}>
                {message.media ?
                    <div className='space-y-1'>
                        <img className='w-80 rounded-xl' src={message.media} alt={message.text} />
                        {edit ? (
                            <div>
                                <form onSubmit={handleEdit}>
                                    <textarea
                                        id='textarea'
                                        className='w-full outline-none max-h-96'
                                        name="message_edit"
                                        required
                                        value={text}
                                        autoFocus
                                        onKeyDown={handleEdit}
                                        autoComplete="none"
                                        onChange={handleChange}
                                    />
                                </form>
                            </div>
                        ) : (
                            <div>
                                {message.text}
                            </div>
                        )}
                    </div> :
                    <div>
                        {edit ? (
                            <div>
                                <form onSubmit={handleEdit}>
                                    <textarea
                                        id='textarea'
                                        className='w-full outline-none max-h-96 rounded-2xl px-3 py-2 bg-black bg-opacity-20'
                                        name="message_edit"
                                        required
                                        value={text}
                                        autoFocus
                                        onKeyDown={handleEdit}
                                        autoComplete="none"
                                        onChange={handleChange}
                                    />
                                </form>
                                <div className='flex justify-center space-x-1 text-sm'>
                                    <button className='border-b' onClick={(e) => { handleEdit(e, 13) }}>
                                        Enter
                                    </button>
                                    <p>to submit change,</p>
                                    <button className='border-b' onClick={(e) => { handleEdit(e, 27) }}>
                                        Esc
                                    </button>
                                    <p>to cancel</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {message.text}
                            </div>
                        )}
                    </div>
                }
                <small className='opacity-70 text-xs'>
                    <Moment calendar>{message.createdAt.toDate()}</Moment>
                </small>
            </div>
        </div>
    )
}

export default Messages