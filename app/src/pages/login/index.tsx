import React, { useEffect, useState } from 'react'
import style from './style.module.css'
import GLogo from './G.svg'
import { getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { useHistory } from 'react-router-dom'

export default function Login() {
    const auth = getAuth()
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const handleLogin = () => {
        setLoading(true)
        const provider = new GoogleAuthProvider()
        signInWithRedirect(auth, provider).catch(err => {
            setLoading(false)
            console.error(err)
        })
    }
    useEffect(() => {
        const sub = onAuthStateChanged(auth, user => {
            if (user) {
                history.push('/files')
            }
            else {
                setLoading(false)
            }
        })
        return sub
    }, [auth, history])
    return (
        <div className={style.root}>
            <header className={style.header}>
                <h2>trible</h2>
            </header>
            <div className={style.main}>
                <button disabled={loading} onClick={handleLogin}>
                    <img src={GLogo} />
                    Sign In with Google
                </button>
            </div>
        </div>
    )
}
