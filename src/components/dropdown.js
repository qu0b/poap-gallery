import React, { useState } from 'react';
import Arrow from '../assets/images/angle_down.svg';

export default function Dropdown({title, options, defaultOption, onClickOption}) {
  
  const [_title, setTitle] = useState(title)
  const [displayMenu, setDisplayMenu] = useState(false)

  const toggleDisplayMenu = () => {
    setDisplayMenu(!displayMenu)
  }

  let optionsElements = []
  for(let i = 0; i < options.length; i++) {
    optionsElements.push(
      <div className={`option ${options[i] === defaultOption?'active':''}`} onClick={() => {
        setTitle(options[i])
        toggleDisplayMenu()
        onClickOption(options[i])
      }}>{options[i]}</div>
    )
  }

  return (
    <div className="select" style={{position: 'relative'}}
      onMouseLeave={() => setDisplayMenu(false)}
      >
      <div style={{position: 'absolute', top: '7px', right: '5px'}}><img src={Arrow} alt='select arrow' /></div>
      <div className="select-button"
        onClick={toggleDisplayMenu}
        onMouseEnter={() => setDisplayMenu(true)}
        > {_title} </div>

      {
        displayMenu ? (
        <div className='select-options'
          onMouseLeave={() => setDisplayMenu(false)}
          >
          {optionsElements}
        </div>)
        : null
      }
    </div>

  );
}
