import { useEffect, useState } from 'react'
import style from './style.module.css'
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import { getFirestore, collection, query, onSnapshot, Unsubscribe, where } from 'firebase/firestore'
import { useHistory } from 'react-router-dom'

type File = {
    name: string;
    language: string;
    id: string;
};

export default function Projects() {
    const auth = getAuth()
    const db = getFirestore()
    const history = useHistory()
    const [files, setfiles] = useState<File[]>([])
    const [user, setUser] = useState<User | null>(null)
    useEffect(() => {
        let filesub: Unsubscribe
        const authsub = onAuthStateChanged(auth, user => {
            if (user) {
                setUser(user)
                const q = query(collection(db, 'files'), where("uid", "==", user.uid));
                filesub = onSnapshot(q, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const tmp = docs.map(doc => {
                        const t: File = {
                            name: doc.get("name") as string,
                            id: doc.id,
                            language: doc.get("language") as string
                        };
                        return t
                    })
                    setfiles(tmp)
                })
            }
            else {
                history.push('/')
            }
        })
        return () => {
            authsub()
            filesub()
        }
    }, [db, auth, history])
    return (
        <div className={style.root}>
            <header className={style.header}>
                <h2>trible</h2>
                <button onClick={() => signOut(auth)}>
                    sign out
                    <img src={(user) ? (user.photoURL || "") : ""} />
                </button>
            </header>
            <div className={style.toolbar}>
                <p>Files</p>
                <button className={style.new_btn} onClick={() => history.push('/files/new')}>new</button>
            </div>
            <div style={{ display: 'flex' }}>
                <div className={style.main}>
                    <div className={style.tableHead}>
                        <p>name</p>
                        <p>language</p>
                    </div>
                    <div style={{ height: 40, width: "100%" }}></div>
                    {
                        files?.map((val, i) => {
                            return (
                                <div key={i} className={style.tableitem} onClick={() => history.push('/files/' + val.id)}>
                                    <p>{val.name}</p>
                                    <p>{val.language}</p>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={style.sidebar} >
                    <img src="/GitHub_Logo.png" style={{ height: 50 }} />
                    <a href="https://github.com/anishchaudhary27/online-python-editor">https://github.com/anishchaudhary27/online-python-editor</a>
                </div>
            </div>
        </div>
    )
}
