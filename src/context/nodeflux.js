import { db, auth } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"

const ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY
const SECRET_ACCESS_KEY = process.env.REACT_APP_SECRET_ACCESS_KEY
const PROXY_SERVER = process.env.REACT_APP_PROXY_SERVER

export const getPhotoID = (user_id) => {
    // get the user ID from firebase auth and separate each string into an array element
    const userID = [...user_id]
    // converts the user ID to decimal representation of each string
    let converted_userID = ""
    userID.forEach(id_string => {
        converted_userID += id_string.charCodeAt(0)
    })
    return converted_userID
}

// nodeflux authentication API call. will be used to call any nodeflux API (construct auth key, timestamp, and token)
export const nodefluxAuth = async () => {
    return await fetch(PROXY_SERVER + "/api/nodeflux/authorization", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "access_key": ACCESS_KEY,
            "secret_key": SECRET_ACCESS_KEY
        })
    }).then(response => {
        return response.json()
    }).then(authorization => {
        const DATE = authorization.headers['x-nodeflux-timestamp'].slice(0, 8)
        const TOKEN = authorization.token
        return {
            "auth_key": `NODEFLUX-HMAC-SHA256 Credential=${ACCESS_KEY}/${DATE}/nodeflux.api.v1beta1.ImageAnalytic/StreamImageAnalytic, SignedHeaders=x-nodeflux-timestamp, Signature=${TOKEN}`,
            "timestamp": authorization.headers['x-nodeflux-timestamp']
        }
    }).catch(e => { console.log(e.message) })
}

// nodeflux face enrollment delete API call. will be used when user decides to remove verification with face match
export const nodefluxDeleteEnroll = async (authorization = null) => {
    let nodeflux_auth;
    if (authorization) {
        nodeflux_auth = {
            "auth_key": authorization.auth_key,
            "timestamp": authorization.timestamp
        }
    } else {
        nodeflux_auth = await nodefluxAuth()
    }
    const photo_id = getPhotoID(auth.currentUser.uid)

    return await fetch(PROXY_SERVER + '/api/nodeflux/face_enrollment_delete', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": nodeflux_auth.auth_key,
            "x-nodeflux-timestamp": nodeflux_auth.timestamp,
        },
        body: JSON.stringify({
            "additional_params": {
                "face_id": photo_id
            }
        })
    }).then(response => {
        return response.json()
    }).then(result => {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
            faceEnrollment: false,
            faceEnrollmentID: "",
            hasVerifiedSignIn: false
        })
        return { "response": result, "auth_key": nodeflux_auth.auth_key, "timestamp": nodeflux_auth.timestamp }
    }).catch(e => { console.log(e.message) })
}

// nodeflux face enrollment API call. will be used when user decides to use sign in with face verification
export const nodefluxEnroll = async (authorization = null, image) => {
    let nodeflux_auth;
    // meaning it's been called before
    if (authorization) {
        nodeflux_auth = {
            "auth_key": authorization.auth_key,
            "timestamp": authorization.timestamp
        }
    } else {
        nodeflux_auth = await nodefluxAuth()
    }
    // getting the decimal representation of current user id
    const photo_id = getPhotoID(auth.currentUser.uid)

    return fetch(PROXY_SERVER + "/api/nodeflux/face_enrollment", {
        method: "POST",
        headers: {
            "authorization": nodeflux_auth.auth_key,
            "x-nodeflux-timestamp": nodeflux_auth.timestamp,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "additional_params": {
                "auto_orientation": false,
                "face_id": photo_id
            },
            "images": [image] // [portrait && !useVideo ? portrait : capturedImg]
        })
    }).then(response => {
        return response.json()
    }).then(result => {
        return { "response": result, "auth_key": nodeflux_auth.auth_key, "timestamp": nodeflux_auth.timestamp }
    }).catch(e => { console.log(e) })
}

// nodeflux face match will enrollment API call. will be used whenever a user that has sign in with face verification
// has the feature enabled is trying to sign in to Rebah. 
export const nodefluxMatchEnroll = async (authorization = null, capturedImg) => {
    let nodeflux_auth;
    // meaning it's been called before
    if (authorization) {
        nodeflux_auth = {
            "auth_key": authorization.auth_key,
            "timestamp": authorization.timestamp
        }
    } else {
        nodeflux_auth = await nodefluxAuth()
    }
    // getting the decimal representation of current user id
    const photo_id = getPhotoID(auth.currentUser.uid)
    return fetch(PROXY_SERVER + "/api/nodeflux/face_match", {
        method: "POST",
        headers: {
            "authorization": nodeflux_auth.auth_key,
            "x-nodeflux-timestamp": nodeflux_auth.timestamp,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "additional_params": {
                "auto_orientation": false,
                "get_main_face": true,
                "face_id": photo_id
            },
            "images": [capturedImg]
        })
    }).then(response => {
        return response.json()
    }).then(result => {
        // console.log(result)
        return { "response": result, "auth_key": nodeflux_auth.auth_key, "timestamp": nodeflux_auth.timestamp }
    }).catch(e => { console.log(e) })
}