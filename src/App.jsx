import { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import noteServices from './services/notes'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

function App() {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  // Get all notes
  useEffect(() => {
    noteServices
    .getAll()
    .then(
      initialNotes => {
      setNotes(initialNotes)
    })
  }, [])

  // Check if user credentials already exist
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteServices.setToken(user.token)
    }
  }, [])
  
  if (!notes) {
    return (
      <div>
        <h1>Notes</h1>
        <p>Fetching data...</p>
      </div>
    )
  }

  // Add new note
  const addNote = async (noteObject) => {
    const returnedNote = await noteServices.create(noteObject)
    setNotes(notes.concat(returnedNote))
  }

  // Update importance of a note 
  const toggleImportanceOf = async id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important } 

    try {
      const returnedNote = await noteServices.update(id, changedNote)
      setNotes(notes.map(note => note.id === id ? returnedNote : note))
    } catch (exception) {
      setErrorMessage(
        `Note '${note.content}' was already removed!`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNotes(notes.filter(note => note.id !== id))
    }
  }

  // Handle login
  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({username, password})
      window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(user))
      noteServices.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Function for generating login form
  const loginForm = () => (
    <Togglable buttonLabel="login">
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  // Function for generating note form
  const noteForm = () => (
    <Togglable buttonLabel="new note">
      <NoteForm
        createNote={addNote}
      />
    </Togglable>
  )

  // Toggles important notes' visibility
  const notesToShow = showAll
  ? notes
  : notes.filter(note => note.important === true)

  return (
    <div>
      <h1>Notes</h1>

      <Notification message={errorMessage}/>

      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          {noteForm()}
        </div>
      )}

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>

      <ul>
        {notesToShow.map(note => 
        <Note key={ note.id } note={ note } toggleImportance={() => toggleImportanceOf(note.id)}/>
        )}
      </ul>
    </div>
  )
}

export default App