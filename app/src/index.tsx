import * as ReactDOM from 'react-dom';
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCA8Z8emKA3yfPOQjj5YV9SK8JbR3d8Exw",
    authDomain: "trible-2706.firebaseapp.com",
    projectId: "trible-2706",
    storageBucket: "trible-2706.appspot.com",
    messagingSenderId: "1075956632820",
    appId: "1:1075956632820:web:61eb6bbf34a4c1f8dfa2a1",
    measurementId: "G-76BZJ2HMDH"
};

const app = initializeApp(firebaseConfig);
if (window.location.hostname !== 'localhost') {
    getAnalytics(app);
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
)