# **Rebah**

Rebah is a social messenger application that doesn't collect user information and has an integrated\
face verification whenever user signs in. It is created using the React framework plus Tailwind CSS for\
saving a lot of time and pain dealing with CSS.

## **Features**

- A functional messenger web application
- Send, edit, and delete messages
- Customize your profile picture and username
- Optional sign in with face verification - Powered by Nodeflux

## **Technical Information**
#### ***TL;DR***

This project was created using:
- React Framework
- Tailwind CSS
- Firebase Firestore
- NodeJS
- ExpressJS

### ***The* true *technical information***

As mentioned in the brief description above, **this web application is made using the React framework**\
combined with **Tailwind CSS** for the styling of the pages. Additionally, **Firebase Firestore** is used as the\
backend database for storing messages data and images uploaded into the website. **NodeJS** and\
**ExpressJS** is also used for the backend proxy server to connect this application to the **Nodeflux**\
API endpoint. 

## **Other information worth mentioning**
The database for this project is already hosted online by default. You can also create a new Firebase Firestore\
database by clicking [this link](https://firebase.google.com/) and making a new Firestore database (I'm not sponsored to say this by the way).\
Additionally, [Herokuapp](https://heroku.com) is used for hosting the proxy server to bridge the connection between this app\
and Nodeflux's service. Last but not least, [Vercel](https://vercel.com/) is used to host the frontend part of this application. 

Additionally, if you decided to clone this repo, go to the directory where you want to store the cloned repo,\
then open your terminal and type
```sh
cd rebah
```
After cloning the repo and `cd` to the `rebah` folder, type
```sh
npm i or npm install
```
it will install all the necessary modules required for this application to run. 
After that, you should read\
[Tailwind's tutorial](https://tailwindcss.com/docs/guides/create-react-app) on initializing Tailwind CSS in the project. Before starting the app, you should make a new\
[Firebase](https://firebase.google.com/) project and making a new Firestore database. There are many tutorials online on how to create one.\
After one has been created and the config file for your app has been generated, add this following line into\
your config file:
```js
databaseURL:"https://{YOUR_PROJECT_ID}.firebaseio.com",
```
If you want to use the default configuration of this project, you must create a new `.env` file in the root folder (`./rebah`) with
```env
REACT_APP_{YOUR_KEY_NAME}={YOUR_KEY_VALUE}
```
**for each values that are going to be stored inside the `.env` file.** The `REACT_APP_` sequence before the key\
name is required **in order for React to be able to process the environment variable.** You should store the\
Firebase Firestore app configuration in this file. Other than because it's the deault config for this project, it's\
safer too.

*If you haven't been using this approach in your projects, consider using environment variables from now on to keep your sensitive information safe.*

Have fun using Rebah, and thanks for checking this repo out!
<br>
<br>
>##### Made with ❤ by Karel Bondan & Leon Jayakusuma