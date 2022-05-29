import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import axios from 'axios'

// const express = require('express');
// // const request = require('request');
// const ACCESS_KEY = process.env.ACCESS_KEY
// const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY

// const app = express();

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

// app.get('/api/nodeflux/authorization', (req, res) => {
//   // request({
//   //   url: "https://backend.cloud.nodeflux.io/auth/signatures",
//   //   method: "POST",
//   //   headers: {
//   //     "Content-Type": "application/json"
//   //   },
//   //   data: {
//   //     "access_key": ACCESS_KEY,
//   //     "secret_key": SECRET_ACCESS_KEY
//   //   }
//   // }, (error, response, body) => {
//   //   console.log(error)
//   //   console.log("")
//   //   // console.log(JSON.parse(JSON.stringify(response)))
//   //   let jjson = JSON.parse(JSON.stringify(response))
//   //   console.log(jjson)
//   //   return res.status(jjson.statusCode).json(body)
//   // })

//   axios.post("https://backend.cloud.nodeflux.io/auth/signatures", {
//     "access_key": ACCESS_KEY,
//     "secret_key": SECRET_ACCESS_KEY
//   }, {
//     headers: {
//       "Content-Type": "application/json"
//     }
//   }).then(response => {
//     console.log(JSON.stringify(response))
//   })
// });

// // app.get('/api/nodeflux/face_enrollment', (req, res) => {
// //   request({
// //     url: "https://api.cloud.nodeflux.io/v1/analytics/create-face-enrollment",
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json"
// //     },
// //     json: {
// //       "additional_params": {
// //         "auto_orientation": false,
// //         "face_id": `${"id_from_firebase"}`
// //       },
// //       "images": [
// //         `${"base64processedimg"}`
// //       ]
// //     }
// //   }, (error, response, body) => {
// //     let jjson = JSON.parse(JSON.stringify(response))
// //     return res.status(jjson.statusCode).json(body)
// //   })
// // });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`listening on ${PORT}`));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
