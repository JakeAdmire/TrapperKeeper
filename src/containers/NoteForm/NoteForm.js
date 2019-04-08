import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { hasError } from '../../actions/index';
import { fetchOptionsCreator } from '../../utility/fetchOptionsCreator'
import { fetchData } from '../../utility/fetchData';
import { fetchAllNotes } from '../../thunks/fetchAllNotes'
import { ListItem } from '../../components/ListItem/ListItem';
import NoteOptions from '../../components/NoteOptions/NoteOptions';

export class NoteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      toHomePage: false,
      displayError: false,
      list: [
        {
          id: shortid.generate(),
          isComplete: false,
          text: '',
        },
      ]
    }
  }

  componentDidMount = async () => {
    this.props.noteId && await this.findNote(this.props.noteId);
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (event) => {
    if ( event.code !== 'Escape' ) return null;
    this.setState({toHomePage: true});
  }

  findNote = async (noteId) => {
    const url = `http://localhost:3001/api/v1/notes/${noteId}`;
    try {
      const response = await fetchData(url);
      const { id, title, list } = response;
      this.setState({
        id,
        title,
        list: [...list]
      })
    } catch(error) {
      error.message === 'Note was not found' && this.setState({displayError: true})
    }
  }

  handleSeperate = () => {
    const { list } = this.state;
    let completedItems = list.filter(item => item.isComplete);
    let incompletedItems = list.filter(item => !item.isComplete);
    return {
      completedItems,
      incompletedItems
    }
  }

  handleType = (e) => {
    e.preventDefault();
    const { type } = this.props;
    if (type === "new-note" || type === "existing-note") this.handlePostandPut(type)
  }

  handlePostandPut = async (type) => {
    const { title, list } = this.state;
    let path = type === 'new-note' ? 'POST' : 'PUT';
    let urlEnd = type === 'new-note' ? 'notes' : `notes/${this.props.id}`;
    const url = `http://localhost:3001/api/v1/${urlEnd}`;
    try {
      const options = await fetchOptionsCreator(path , { title, list });
      await fetchData(url, options);
      if (path === 'POST') this.props.fetchAllNotes(url);
      this.setState({toHomePage: true});
    } catch(error) {
      this.props.hasError(error.message);
    }
  }

  handleTitleChange = (e) => {
    const { name, value } = e.target;
    this.setState({[name]: value});
  }

  handleItemChange = (e, id) => {
    const { list } = this.state;
    const foundItem = list.find(item => item.id === id);
    foundItem.text = e.target.value;
    this.setState({ list });
    this.generateNewListItem(e, foundItem);
  }

  generateNewListItem = (e, foundItem) => {
    const { value } = e.target;
    const items = this.handleSeperate();
    const lastItem = items.incompletedItems.pop();
    if (value.length === 1 && foundItem.id === lastItem.id) this.addItem();
  }

  handleItemDelete = (e, id) => {
    e.preventDefault();
    const { list } = this.state;
    const foundIndex = list.findIndex(item => item.id === id);
    list.splice(foundIndex, 1);
    this.setState({list});
  }

  addItem = () => {
    let defaultItem = {
      id: shortid.generate(),
      isComplete: false,
      text: ''
    };
    this.setState({list: [...this.state.list, defaultItem]});
  }

  deleteNote = async (e) => {
    e.preventDefault();
    const url = `http://localhost:3001/api/v1/notes`;
    try {
      const options = await fetchOptionsCreator('DELETE', {})
      await fetchData(`${url}/${this.props.id}`, options);
      this.props.fetchAllNotes(url);
      this.setState({ toHomePage: true });
    } catch (error) {
      this.props.hasError(error.message);
      if(error.message === 'Note not found') {this.props.hasError('note can not be deleted')};
    }
  }

  toggleComplete = (id) => {
    const { list } = this.state;
    const updatedList = list.map(item => {
      if (id === item.id) item.isComplete = !item.isComplete;
      return item;
    });
    this.setState({list: updatedList});
  }

  handleClose = () => {
    this.props.hasError('');
  }

  render() {
    const seperatedList = this.handleSeperate();
    const { completedItems, incompletedItems } = seperatedList;
    const { toHomePage, errorPage } = this.state;
    if (toHomePage) return <Redirect to='/' />;
    if (errorPage) return <Redirect to='/404' />;
    let completedMessage = completedItems.length ? `${completedItems.length} Completed Item(s)` : null;
    return (
      <div className="Note">
        <input  type="text"
                className="note-title"
                placeholder="Enter A Title..."
                value={this.state.title}
                name="title"
                onChange={this.handleTitleChange} />
        <ul className="ListItems">
          {
            incompletedItems.map((item, index) => 
              <ListItem key={item.id} 
                        index={index} 
                        toggleComplete={this.toggleComplete} 
                        handleItemChange={this.handleItemChange} 
                        handleItemDelete={this.handleItemDelete} 
                        {...item} /> )
          }
        </ul>
        { completedMessage && <p className="Completed-Message">{completedMessage}</p> }
        <ul className="ListItems Completed">
          {
            completedItems.map((item, index) => 
              <ListItem key={item.id} 
                        index={index}
                        toggleComplete={this.toggleComplete}
                        handleItemChange={this.handleItemChange}
                        handleItemDelete={this.handleItemDelete}
                        {...item} /> )
          }
        </ul>
        <NoteOptions  handleType={this.handleType} 
                      deleteNote={this.deleteNote} 
                      handleClose={this.handleClose} />
        { this.props.error && <h2>{this.props.error}</h2> }
      </div>
    )
  }
}

export const mapStateToProps = (state) => ({
  error: state.error
})

export const mapDispatchToProps = (dispatch) => ({
  hasError: (message) => dispatch(hasError(message)),
  fetchAllNotes: (url) => dispatch(fetchAllNotes(url))
})

NoteForm.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array,
  toHomePage: PropTypes.bool,
  error: PropTypes.string,
  fetchAllNotes: PropTypes.func,
  hasError: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteForm)