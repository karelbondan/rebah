import React, { useEffect, useState } from 'react'
import { db, auth, storage } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import User from '../components/User'
import Message from '../components/Message'
import Messages from '../components/Messages';
import Moment from 'react-moment'
import defimg from '../components/items/default.jpg'
import defbg from '../components/items/bg3.jpg'

const Home = () => {
  const [users, setUsers] = useState([])
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [messages, setMessages] = useState([]);

  const user1 = auth.currentUser.uid;

  useEffect(() => {
    const userref = collection(db, 'users')
    // create query
    const qry = query(userref, where('uid', 'not-in', [user1]))
    // execute query
    const unsub = onSnapshot(qry, querysnap => {
      let users = []
      querysnap.forEach(doc => {
        users.push(doc.data())
      })
      setUsers(users);
    })

    return () => { unsub() }
  }, [])

  const selectusr = async (user) => {
    setChat(user);

    const user2 = user.uid
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

    const msgref = collection(db, 'messages', id, 'chat')
    const qry = query(msgref, orderBy('createdAt', 'asc'))

    onSnapshot(qry, querysnap => {
      let messages = []
      querysnap.forEach(doc => {
        messages.push(doc.data())
      })
      setMessages(messages)
    })

    onSnapshot(doc(db, 'users', user2), docsnap=>{
      setChat(docsnap.data())
    })

    // get last message between logged in user and selected user
    const docsnap = await getDoc(doc(db, 'lastMessage', id))
    if (docsnap.data() && docsnap.data().from !== user1) {
      await updateDoc(doc(db, 'lastMessage', id), {
        unread: false,
        unreadCount: 0
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const user2 = chat.uid
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`
    let url;
    if (img) {
      const imgref = ref(storage, `images/${new Date().getTime()} - ${img.name}`)
      const snap = await uploadBytes(imgref, img)
      const downloadurl = await getDownloadURL(ref(storage, snap.ref.fullPath))
      url = downloadurl
    }


    await addDoc(collection(db, 'messages', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || ""
    })

    let previous_data;

    try {
      let q = await getDoc(doc(db, "lastMessage", id))
      previous_data = q.data()
    } catch (e) {
      console.log(e)
    }

    await setDoc(doc(db, "lastMessage", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
      unreadCount: previous_data.from === user1 ? previous_data.unreadCount + 1 : 1
    })
    setText("")
    setImg("")
  }

  return (
    <div className='flex bg-gray-900 justify-center z-20'>
      <div className='z-0'>
      </div>
      <div className='flex bg-gray-900 h-screen xl:w-5/6 w-full overflow-hidden'>
        <div className='w-0 z-0'>
          <img src={defbg} alt="bg" className='min-h-max min-w-max opacity-40'></img>
        </div>
        <div className='bg-gray-800 text-white w-2/6 z-50 min-w-5-6'>
          {users.map(user => <User key={user.uid} user={user} selectUser={selectusr} user1={user1} chat={chat} />)}
        </div>
        <div className='h-screen overflow-y-hide w-full z-30'>
          {chat ?
            <div className='h-screen flex flex-col justify-between'>
              <div className='z-50 flex space-x-3 items-center text-white text-xl px-5 py-5 bg-gray-800'> {/*sticky top-0*/}
                <img className='w-12 h-12 rounded-full' src={chat.avatar || defimg} alt={chat.username} />
                <div>
                  <h3>{chat.username}</h3>
                  <div className='flex space-x-1 items-center'>
                    <p className='text-sm italic'>{chat.isOnline ? "online" : `last seen`}</p>
                    <p className={`text-sm italic ${chat.lastSeen ? "" : "hidden"}`}>
                      {chat.lastSeen ? <Moment calendar>{chat.lastSeen.toDate()}</Moment> : null}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5 h-full overflow-auto">
                {messages.length ?
                  messages.map((message, i) => <Messages key={i} message={message} user1={user1} />)
                  :
                  <div className='flex items-center justify-center h-full text-4xl opacity-30 font-semibold text-white '>
                    <h3>No message yet. Send one!</h3>
                  </div>
                }
              </div>
              <div className='z-50'>
                <Message handleSubmit={handleSubmit} text={text} setText={setText} setImg={setImg} img={img} />
              </div>
            </div>
            :
            <div className='flex items-center justify-center text-4xl opacity-30 font-semibold text-white h-screen'>
              <h3>Select a user to start conversation</h3>
            </div>}
        </div>
      </div>
    </div>
  )
}

export default Home