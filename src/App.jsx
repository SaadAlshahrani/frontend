import { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import noteServices from './services/notes'

function App() {
  const [notes, setNotes] = useState(null)
  const [newNote, setNewNote] = useState('a new note')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  // Get all notes
  useEffect(() => {
    noteServices
    .getAll()
    .then(
      initialNotes => {
      setNotes(initialNotes)
    })
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
  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteServices
    .create(noteObject)
    .then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNewNote('')
    })
  }

  // Update importance of a note 
  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important } 

    noteServices
    .update(id, changedNote)
    .then(returnedNote => {
      setNotes(notes.map(note => note.id === id ? returnedNote : note))
    })
    .catch(error => {
      setErrorMessage(
        `Note '${note.content}' was already removed!`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNotes(notes.filter(note => note.id !== id))
    })
  }

  // Makes it so that text in form can be modified
  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  // Toggles important notes' visibility
  const notesToShow = showAll
  ? notes
  : notes.filter(note => note.important === true)

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}/>
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
      <form onSubmit={addNote}>
        <input 
        value={newNote}
        onChange={handleNoteChange}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App