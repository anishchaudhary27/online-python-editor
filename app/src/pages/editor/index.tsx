import React, { createRef, KeyboardEventHandler, useEffect, useState } from 'react'
import style from './style.module.css'
import { getFirestore, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useHistory, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import * as monaco from 'monaco-editor'

type Param = {
    id: string;
}

type Response = {
    data: string | undefined;
    code: Int16Array | undefined;
    type: string;
}

export default function Editor() {
    const editorRef: React.RefObject<HTMLInputElement> = createRef()
    const resizerRef: React.RefObject<HTMLInputElement> = createRef()
    const outputRef: React.RefObject<HTMLInputElement> = createRef()
    const terminalRef: React.RefObject<HTMLInputElement> = createRef()
    const [model, setModel] = useState<monaco.editor.IModel | null>(null)
    const [logs, setLogs] = useState([""])
    const [running, setrunning] = useState(false)
    const [terminal_input, setterminal_input] = useState("")
    const auth = getAuth()
    const db = getFirestore()
    const [conn, setconn] = useState<WebSocket | null>(null)
    let editor: monaco.editor.IStandaloneCodeEditor
    const history = useHistory()
    let { id } = useParams<Param>()
    let isnew = false;
    if (id === 'new') {
        id = uuid()
        isnew = true
    }
    const [name, setname] = useState("")
    const [status, setStatus] = useState("fetching file...")
    const language = "python"
    let dbref = doc(db, 'files/' + id)
    const [uid, setUid] = useState("")

    const handleResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
    }

    const resize = (ev: MouseEvent) => {
        if (editorRef.current) {
            editorRef.current.style.width = ev.pageX - 5 + "px"
        }
        if (outputRef.current) {
            outputRef.current.style.width = window.innerWidth - 5 - ev.pageX + "px"
        }
    }
    const stopResize = () => {
        window.removeEventListener('mousemove', resize)
    }

    const saveFile = () => {
        if (model) {
            const code = model.getValue()
            setStatus("saving changes...")
            setDoc(dbref, {
                name,
                code,
                uid,
                language
            })
                .then(_ => {
                    setStatus("")
                    history.replace('/files/' + id)
                })
                .catch(error => {
                    console.error(error)
                    setStatus("error while saving file!!")
                })
        }
    }

    const deleteFile = () => {
        if (!isnew) {
            setStatus("deleting file...")
            deleteDoc(dbref)
                .then(_ => {
                    history.push('/files')
                })
                .catch(error => {
                    console.error(error)
                    setStatus("error while deleting file!!")
                })
        }
    }

    const sendStop = () => {
        if (running && conn) {
            const req = JSON.stringify({
                type: "exit"
            })
            conn.send(req)
            setStatus("killing process...")
        }
    }

    const runfile = () => {
        if (model && !running && conn) {
            setLogs([])
            const code = model.getValue()
            const req = JSON.stringify({
                type: "run",
                value: code
            })
            conn.send(req)
            setrunning(true)
            setStatus("running code...")
        }
    }

    useEffect(() => {
        window.addEventListener("keypress", () => {
            setStatus("unsaved changes!!")
        })
        window.addEventListener("keydown", () => {
            setStatus("unsaved changes!!")
        })
        const authsub = onAuthStateChanged(auth, user => {
            if (!user) {
                history.push('/')
            }
            else {
                setUid(user.uid)
                if (isnew) {
                    setname('untitled')
                    setStatus("unsaved changes!!")
                }
                else {
                    getDoc(dbref)
                        .then(doc => {
                            setStatus("")
                            setname(doc.get('name'))
                            const cd = doc.get('code')
                            editor.getModel()?.setValue(cd)
                        })
                        .catch(error => {
                            console.error(error)
                            setStatus("error occured while fetching file!!")
                        })
                }
            }
        })
        if (editorRef.current) {
            editor = monaco.editor.create(editorRef.current, {
                automaticLayout: true,
                language
            })
            const m = editor.getModel()
            setModel(m)
        }
        const tmpconn = new WebSocket('wss://runtime-yfdohps2fa-el.a.run.app')
        setconn(tmpconn)
        tmpconn.onmessage = (ev) => {
            const resp: Response = JSON.parse(ev.data)
            switch (resp.type) {
                case "data":
                    if (resp.data) {
                        const lines = resp.data.split('\n')
                        let t = logs.slice()
                        lines.forEach(ln => {
                            t.push(ln)
                        })
                        setLogs(t)
                    }
                    break;
                case "exit":
                    setrunning(false)
                    setStatus("")
                    break
                case "runtime_error":
                    setStatus("runtime error occured!!")
                    window.location.reload()
                    break
                default:
                    break;
            }
        }
        return () => {
            authsub()
            tmpconn.close()
        }
    }, [db, auth, history])

    const handleTerminalInput: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key == "Enter") {
            if (running && conn) {
                const req = JSON.stringify({
                    type: "input",
                    value: terminal_input
                })
                conn.send(req)
                setterminal_input("")
            }
        }
        else {
            const tmp = terminal_input + e.key
            setterminal_input(tmp)
        }
    }

    return (
        <div className={style.root}>
            <div className={style.toolbar}>
                <img src="/python.svg" className={style.language_logo} />
                <input value={name} onChange={(e) => { setname(e.target.value); setStatus("unsaved changes!!") }} />
                <p>{status}</p>
                {
                    running && <img src={'/pause.svg'} className={style.img_button} onClick={sendStop} />
                }
                {
                    !running && <img src={'/play.svg'} className={style.img_button} onClick={runfile} />
                }
                <img src={'/save.svg'} className={style.img_button} onClick={saveFile} />
                <img src={'/delete.svg'} className={style.img_button} onClick={deleteFile} />
            </div>
            <div className={style.main}>
                <div className={style.editor_container} ref={editorRef} />
                <div className={style.resize_bar} ref={resizerRef} onMouseDown={handleResize}>
                    <img src="/dots.svg" />
                </div>
                <div className={style.output_container} ref={outputRef}>
                    <h3>Output</h3>
                    {
                        logs.map((val, n) => {
                            return <p key={n}>{val}</p>
                        })
                    }
                    <div style={{ height: 100, width: "100%" }} />
                    <input className={style.output_input} disabled={!running} placeholder="terminal input" value={terminal_input} onKeyPress={handleTerminalInput} />
                </div>
            </div>
        </div>
    )
}
