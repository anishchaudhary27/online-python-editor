import * as ReactDOM from 'react-dom';
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './Firebasekey.js'

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