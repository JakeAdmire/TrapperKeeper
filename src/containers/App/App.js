import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import { connect } from 'react-redux';
import { hasError } from '../../actions/index';
import { Header } from '../../components/Header/Header';
import NotesContainer from '../NotesContainer/NotesContainer';
import NoteForm from '../NoteForm/NoteForm';
import PropTypes from 'prop-types'
import { fetchAllNotes } from '../../thunks/fetchAllNotes'

export class App extends Component {

  componentDidMount() {
    this.props.fetchAllNotes()
  }

  render() {
    return (
      <div className="App">
        <Header />
        <main className="Content-Container">
          <Route path="/" render={() => {
            return <NotesContainer />
          }} />
          <Route path="/notes/:id" render={({match}) => {
            const { id } = match.params;
            const currentNote = this.props.allNotes.find(note => note.id == id)
            return <NoteForm type="existing-note" noteId={id} {...currentNote}/>
          }} />
          <Route path="/new-note" render={ () => <NoteForm type="new-note"/> } />
        </main>
      </div>
    );
  }
}

export const mapStateToProps = (state) => ({
  allNotes: state.allNotes,
  error: state.error
})

export const mapDispatchToProps = (dispatch) => ({
  showError: (message) => dispatch(hasError(message)),
  fetchAllNotes: (url) => dispatch(fetchAllNotes(url)),
})

App.propTypes = {
  allNotes: PropTypes.array,
  error: PropTypes.string,
  storeNote: PropTypes.func,
  fetchNotes: PropTypes.func,
  showError: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
