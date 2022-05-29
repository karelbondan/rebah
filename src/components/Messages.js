import React from 'react'
import Moment from 'react-moment'

const Messages = ({ message, user1 }) => {
    // const scroll = useRef();

    // useEffect(() => {
    //     scroll.current element.scrollIntoView({behavior: "smooth"})
    // }, []);

    return (
        <div className={`mb-2 ${message.from === user1 ? "text-right" : ""}`}>
            <div className={`max-w-3xl ${message.from === user1 ? " bg-purple-400 inline-block rounded-2xl px-4 py-2 text-white" : "bg-gray-800 inline-block text-white rounded-2xl px-4 py-2"}`}>
                {message.media ?
                    <div>
                        <img className='w-80 rounded-xl' src={message.media} alt={message.text} />
                        <div className=''>{message.text}</div>
                    </div>
                    :
                    message.text}
                <br />
                <small className='opacity-70 text-xs'>
                    <Moment calendar>{message.createdAt.toDate()}</Moment>
                </small>
            </div>
        </div>
    )
}

export default Messages