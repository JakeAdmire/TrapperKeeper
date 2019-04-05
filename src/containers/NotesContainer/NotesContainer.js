import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

export class NotesContainer extends Component {

  generateNotes() {
    return this.props.allNotes.map(note => 
      <Link to={`/notes/${note.id}`} key={note.id} className='note-click'>
        <div>
          <h3>{note.title}</h3>
        </div>
      </Link>
    )
  }

  render() {
    return (
      <div className="NotesContainer">
        { this.props.allNotes && this.generateNotes() }
      </div>
    )
  }
}

export const mapStateToProps = (state) => ({
  allNotes: state.allNotes,
})

export default connect(mapStateToProps)(NotesContainer);