import React from 'react';
import { shallow } from 'enzyme';
import { NotesContainer, mapStateToProps } from './NotesContainer';

describe('NotesContainer', () => {
  describe('NotesContainer', () => {
    let wrapper;
    
    const mockShortid = jest.fn().mockReturnValue('12345789'); 
    
    const mockAllNotes = [
        { id: "123ABA",
        title: 'Worf ToDo',
        list: [
          { id: mockShortid,
            text: 'Eat food',
            isComplete: false
          },
        ]
      },
      { id: "987GDGFD",
      title: 'Jake ToDo',
      list: [
        { id: mockShortid,
          text: 'Do basic styling',
          isComplete: false
        },
      ]
    }];

  beforeEach(() => {
    wrapper = shallow(<NotesContainer allNotes={mockAllNotes}/>)
  })

  it('should match the snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('should return JSX when generateNotes is called', () => {
    expect(wrapper.generateNotes).toMatchSnapshot();
  })
});

  describe('mapStateToProps', () => {
    it('should return an object with a notes array', () => {
      const mockState = {
        allNotes: [
          { id: "123ABA", 
            title: 'Worf ToDo', 
            list: [
              { id: "123", text: 'Eat food', isComplete: false },
            ]
          },
          { id: "987GDGFD",
            title: 'Jake ToDo',
            list: [
              { id: "0098", text: 'Do styling', isComplete: false },
            ]
          }
        ],
        error: ""
      }
      const expected = { allNotes: [
        { id: "123ABA", 
          title: 'Worf ToDo', 
          list: [
            { id: "123", text: 'Eat food', isComplete: false },
          ]
        },
        { id: "987GDGFD",
          title: 'Jake ToDo',
          list: [
            { id: "0098", text: 'Do styling', isComplete: false },
          ]
        }
      ]}

      const mappedProps = mapStateToProps(mockState)

      expect(mappedProps).toEqual(expected)
    })
  })
})