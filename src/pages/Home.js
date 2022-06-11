import React, { useEffect, useRef, useState } from 'react'
import { db, auth, storage } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import User from '../components/User'
import Message from '../components/Message'
import Messages from '../components/Messages';
import Moment from 'react-moment'
import defimg from '../components/items/default.jpg'
import defbg from '../components/items/bg3.jpg'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // initial variables
  const [users, setUsers] = useState([])
  const [chat, setChat] = useState("")
  const [currentChat, setCurrentChat] = useState("")
  const [text, setText] = useState("")
  const [img, setImg] = useState("")
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [previousData, setPreviousData] = useState()
  const [init, setInit] = useState()
  const [loading, setLoading] = useState(false)
  const messagesRef = useRef(null)
  const navigate = useNavigate()

  // check if user has been verified or not. if not then redirect them again to the
  // login page, else let them stay in this page
  useEffect(() => {
    const verify_test = async () => {
      setLoading(true)
      const verify = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (verify.data().faceEnrollment && !verify.data().hasVerifiedSignIn) {
        navigate("/login")
        console.log("sjdh kjashdjk ah")
      } 
      setLoading(false)

    }
    verify_test()
  }, [])

  // assign the current user's uid to a new var 
  const user1 = auth.currentUser.uid;

  // these two here are a pain in the arf but i finally managed to make it work :D
  // scrolls to bottom whenever a new message is arrived or when a new msg is sent 
  const scrollToBottom = () => {
    messagesRef.current.scrollIntoView({
      behavior: "smooth", block: "nearest"
    });
  }

  useEffect(() => {
    if (messagesRef.current) {
      scrollToBottom();
    }
  }, [messagesRef, previousData, currentChat])

  // for listing the registered users in the available-to-chat users list
  useEffect(() => {
    const userref = collection(db, 'users')
    const qry = query(userref, where('uid', 'not-in', [user1]))
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
    // set the chat to the current selected recipient
    setChat(user);

    // set the recipient's uid to a new var 
    const user2 = user.uid
    // make a new combination id between current user's and recipient's uids for storing msgs
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

    // query messages between the current user and the selected recipient
    const msgref = collection(db, 'messages', id, 'chat')
    const qry = query(msgref, orderBy('createdAt', 'asc'))

    // update the messages list everytime any of the document inside the collection 
    // changes. besides detecting new messages both when sending and receiving, it's 
    // also very useful to detect update and deletion of messages
    onSnapshot(qry, querysnap => {
      let messages = []
      querysnap.forEach(doc => {
        messages.push(doc.data())
      })
      setMessages(messages)
    })

    // update user status (online/offline) in real time
    onSnapshot(doc(db, 'users', user2), docsnap => {
      setChat(docsnap.data())
    })

    // get latest message between the signed in user and the user they're currently chatting with
    const docsnap = await getDoc(doc(db, 'lastMessage', id))
    if (docsnap.data() && docsnap.data().from !== user1) {
      await updateDoc(doc(db, 'lastMessage', id), {
        unread: false,
        unreadCount: 0
      })
    }

    // set this here because the useRef() needs time to get the referenced element
    setTimeout(() => {
      setCurrentChat(user.uid)
    }, 500);
  }

  // function to handle PUT request to push the message to firebase db
  const handleSubmit = async (e) => {
    e.preventDefault()
    // check if text is empty or only contains a bunch of newlines, if true then dont do anything
    if (!text || /^[\n]+$/.exec(text)) {
      setText("")
      return;
    }
    // setting things up, setText is immediately set to none for responsiveness, setIMG as well is set 
    // to none to avoid overlapping with the 'sending' indicator
    setText("")
    setImg("")
    setSending(true)

    // assign recipient's uid to a new variable
    const user2 = chat.uid

    // make a new id which is a combination of current user's and recipient's uids 
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

    // if user attaches an image to the message then upload that image to firebase and
    // reference the download path to the url var declared below
    let url;
    if (img) {
      const imgref = ref(storage, `images/${new Date().getTime()} - ${img.name}`)
      const snap = await uploadBytes(imgref, img)
      const downloadurl = await getDownloadURL(ref(storage, snap.ref.fullPath))
      url = downloadurl
    }

    // assign the addDoc to a var to be later used to get the auto-generated ID
    const add_msg = await addDoc(collection(db, 'messages', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      chatID: id,
      edited: false,
      media: url || ""
    })

    // update the just pushed document to include a new field (its own ID) to be used as reference later
    // (mainly for delete and edit message)
    await updateDoc(doc(db, 'messages', id, 'chat', add_msg.id), {
      messageID: add_msg.id
    })

    // setting the unread count for the other user to be then showed notification 
    let previous_data;
    try {
      // get doc from firebase, id is current user's uid combined with the recipient's uid
      let q = await getDoc(doc(db, "lastMessage", id))
      // set previous data to the doc gotten from the query to be then referenced in the doc updt below
      previous_data = q.data()
      // this func below is to inform the useEffect to scroll to bottom of page
      setPreviousData(q.data())
      // wait for the update of doc. if this message is from the same user then increment the unread counter,
      // else reset it to 1 because it means the recipient has read the message
      await setDoc(doc(db, "lastMessage", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        messageRefID: add_msg.id,
        unread: true,
        unreadCount: previous_data.from === user1 ? previous_data.unreadCount + 1 : 1
      })
    } catch (e) {
      // if this is the first time the sender chats with the receiver then it won't have 'lastMessage' document,
      // therefore unreadCount just becomes 1, it doesn't matter because the one going to see it is the receiver
      await setDoc(doc(db, "lastMessage", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        messageRefID: add_msg.id,
        unread: true,
        unreadCount: 1
      })
    }
    // set to false to hide the 'sending' indicator
    setSending(false)
  }

  return loading ? (
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
  ) : (
    <div className='flex bg-gray-900 justify-center z-20'>
      <div className='z-0'>
      </div>
      <div className='flex bg-gray-900 h-screen xl:w-5/6 w-full overflow-hidden'>
        <div className='w-0 z-0'>
          <img src={defbg} alt="bg" className='min-h-max min-w-max opacity-40'></img>
        </div>
        <div className='bg-gray-800 text-white w-2/6 z-50 min-w-5-6 overflow-y-scroll'>
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
              <div id="chat_view_area" className="px-5 py-5 h-full overflow-auto">
                {messages.length ?
                  messages.map((message, i) => <Messages key={i} message={message} user1={user1} />)
                  :
                  <div className='flex items-center justify-center h-full text-4xl opacity-30 font-semibold text-white '>
                    <h3>No message yet. Send one!</h3>
                  </div>
                }
                <div ref={messagesRef} />
              </div>
              <div className='z-50'>
                <Message handleSubmit={handleSubmit} text={text} setText={setText} setImg={setImg} img={img} sending={sending} />
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