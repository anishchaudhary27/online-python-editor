import { Switch, Route } from 'react-router-dom'
import Files from './pages/files'
import Editor from './pages/editor'
import Login from './pages/login'

export default function App() {
    return (
        <Switch>
            <Route exact path="/" component={() => <Login />} />
            <Route exact path="/files" component={() => <Files />} />
            <Route exact path="/files/:id" component={() => <Editor />} />
            <Route path="*" component={() => <h1>Page not found!!</h1>} />
        </Switch>
    )
}
