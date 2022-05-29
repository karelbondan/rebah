import React, { useEffect, useState } from 'react'
import img from '../components/items/default.jpg'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

const User = ({ user1, user, selectUser, chat }) => {
    const user2 = user.uid
    const [data, setData] = useState('')

    useEffect(() => {
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`
        let unsub = onSnapshot(doc(db, 'lastMessage', id), (document) => {
            setData(document.data())
            // console.log(document.data())
            // console.log(data)
        })

        return () => unsub()
    }, [])

    return (
        <div className={`userwrapper cursor-pointer ${chat ? chat.uid === user2 ? "bg-slate-700" : "" : ""}`} onClick={() => selectUser(user)}>
            <div className='px-4 py-3 border-b border-gray-700'>
                <div className='flex items-center space-x-4'>
                    <img src={user.avatar ? user.avatar : img} className='rounded-full w-12 h-12' />
                    <div className='w-full max-w-3-6'>
                        <div className='flex items-center justify-between'>
                            <h4 className={`text-lg truncate ${data ? data.from === user.uid && data.unread ? "font-bold" : "" : ""}`}>{user.username}</h4>
                            <div className={`${user.isOnline ? 'bg-green-500 rounded-full w-2 h-2' : 'bg-red-600 rounded-full w-2 h-2'}`} />
                        </div>
                        <div className={`flex justify-between items-center space-x-2 ${data ? "" : "hidden"}`}>
                            <span className={`max-w-4-6 ${data ? data.from === user.uid && data.unread ? "font-bold" : "" : ""}`}>
                                <p className='text-sm truncate'>
                                    {data ? data.from === user1 ? "You:" : null : null} {data ? data.text : null}
                                </p>
                            </span>
                            <div className='rounded-full bg-green-600 text-sm px-2'>
                                {data ? data.unreadCount && data.from !== user1 ? data.unreadCount : null : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default User