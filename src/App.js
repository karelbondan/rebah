import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar';
import Invalid from './pages/Invalid';
import Register from './pages/Register';
import Login from './pages/Login';
import Test from './pages/Test';
import Profile from './pages/Profile';
import FaceMatch from './pages/FaceMatch';
import Private from './components/Private'
import AuthProvider from './context/auth';
import WithoutNavbar from './components/WithoutNavbar';
import WithNavbar from './components/WithNavbar';
import { db, auth } from './firebase'
import { doc, Timestamp, updateDoc } from 'firebase/firestore'

let timeout;

const startTimeout = async () => {
  // console.log("timer started")
  timeout = setTimeout(() => {
    try {
      updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isOnline: false,
        lastSeen: Timestamp.fromDate(new Date())
      })
    } catch (e) { }
    // console.log("logged out user")
  }, 2000);
}

const stopTimeout = () => {
  clearTimeout(timeout);
  try {
    updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isOnline: true,
      lastSeen: ""
    })
  } catch (e) { }
  // console.log("timer stopped")
}

window.onbeforeunload = () => {
  try {
    updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isOnline: false,
      lastSeen: Timestamp.fromDate(new Date())
    });
  } catch (e) {
    return;
  }
}

function App() {
  return (
    <div onMouseLeave={startTimeout} onMouseEnter={stopTimeout}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<WithNavbar />}>
              <Route exact path='/register' element={<Register />} />
              <Route exact path='/login' element={<Login />} />
              <Route exact path='/test' element={<Test />} />
              <Route exact path='/profile' element={<Private><Profile /></Private>} />
              <Route exact path='/' element={<Private><Home /></Private>} />
              <Route exact path='*' element={<Invalid />} />
            </Route>
            <Route element={<WithoutNavbar />}>
              <Route exact path='/profile/facematch' element={<Private><FaceMatch /></Private>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
