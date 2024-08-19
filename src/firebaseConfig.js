// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC3ZGBLj1BfaIop_qM9GaXFqdueAe38y_w",
    authDomain: "magicdiary-6d027.firebaseapp.com",
    projectId: "magicdiary-6d027",
    storageBucket: "magicdiary-6d027.appspot.com",
    messagingSenderId: "789912737141",
    appId: "1:789912737141:web:01c6bcb85c4b4245922f3c",
    measurementId: "G-NE3PVNHRJT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };