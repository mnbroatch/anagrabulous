import React, { useState } from 'react'
import PropTypes from 'prop-types'

export default function SwapMenu ({ swapGroups, updateSwapGroup, addSwapGroup, removeSwapGroup }) {
  const [lettersToAdd, setLettersToAdd] = useState('')
  return <div>
    <div>
      <input
        value={lettersToAdd}
        onChange={(e) => { setLettersToAdd(e.target.value) }}
      />
      <button
        onClick={() => {
          addSwapGroup(lettersToAdd.split(''))
          setLettersToAdd('')
        }}
      >
        Add Swap Group
      </button>
    </div>
    {swapGroups.map((swapGroup, i) => {
      return (
        <div key={i} className="swap-group">
          <div className="swap-group__row">
            <div className="swap-group__enable">
              <input
                type="checkbox"
                onChange={() => updateSwapGroup(i)} checked={swapGroup.enabled}
                id={`swap-group-${i}`}
              />
              <label htmlFor={`swap-group-${i}`}>
                Enable
              </label>
            </div>
            <button className="swap-group__remove" onClick={() => { removeSwapGroup(i) }}>
              <div className="swap-group__remove-x">
                X
              </div>
            </button>
          </div>
          {swapGroup.letters.map((letterObject) => (
            <div key={letterObject.letter} className="swap-group-letter-checkbox-container">
              {letterObject.letter}
              <input type="checkbox" onChange={() => updateSwapGroup(i, letterObject.letter)} checked={letterObject.enabled} />
            </div>
          ))}
        </div>
      )
    })}
  </div>
}

SwapMenu.propTypes = {
  swapGroups: PropTypes.array,
  updateSwapGroup: PropTypes.func,
  addSwapGroup: PropTypes.func,
  removeSwapGroup: PropTypes.func
}
