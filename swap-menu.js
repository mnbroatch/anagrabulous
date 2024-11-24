import React from 'react'
import PropTypes from 'prop-types'

export default function SwapMenu ({ swapGroups, updateSwapGroup }) {
  return <div>
    {swapGroups.map((swapGroup, i) => {
      console.log('swapGroup.enabled', swapGroup.enabled)
      return (
        <div key={i} className="swap-group">
          <div className="swap-group-checkbox-container">
            <input type="checkbox" onChange={() => updateSwapGroup(i)} checked={swapGroup.enabled} />
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
  updateSwapGroup: PropTypes.func
}
