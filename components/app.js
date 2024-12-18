import React, { useState, useEffect, useReducer } from 'react'
import { produce } from 'immer'
import { makeSwapMap, makeWordTree, getNormalizedLetterObjects, getCandidates, makeCandidateKey, addToCandidatesTree, sortCandidates, makeSwapGroup } from '../utils'
import allWords from '../dict'
import Branch from './branch'
import SwapMenu from './swap-menu'

const wordTree = makeWordTree(allWords)
const cache = {}

export default function App () {
  const [toAnagram, setToAnagram] = useState('')
  const [swapGroups, setSwapGroups] = useState([])
  const [swapMenuOpen, setSwapMenuOpen] = useState(false)

  const swapMap = makeSwapMap(swapGroups)

  const [candidatesTree, dispatch] = useReducer((state, action) => {
    if (action.type === 'addCandidates') {
      const normalizedLetterObjects = action.candidate ? action.candidate.remainingLetterObjects : getNormalizedLetterObjects(toAnagram, swapMap)
      const newCandidates = getCandidates(wordTree, cache, normalizedLetterObjects, wordTree, swapMap)
      return addToCandidatesTree(action.path, newCandidates, state)
    }
    if (action.type === 'clearCandidates') {
      const normalizedLetterObjects = action.candidate ? action.candidate.remainingLetterObjects : getNormalizedLetterObjects(toAnagram, swapMap)
      const newCandidates = getCandidates(wordTree, cache, normalizedLetterObjects, wordTree, swapMap)
      return addToCandidatesTree(action.path, newCandidates, {})
    }
  }, {})

  useEffect(() => {
    const storedSwapGroups = localStorage.getItem('swapGroups')
    if (storedSwapGroups) {
      setSwapGroups(JSON.parse(storedSwapGroups))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('swapGroups', JSON.stringify(swapGroups))
  }, [swapGroups])

  const updateSwapGroup = (index, letter) => {
    if (letter) {
      setSwapGroups(produce(swapGroups, draft => {
        const letterObject = draft[index].letters.find(l => l.letter === letter)
        letterObject.enabled = !letterObject.enabled
      }))
    } else {
      setSwapGroups(produce(swapGroups, draft => {
        draft[index].enabled = !draft[index].enabled
      }))
    }
  }

  const removeSwapGroup = (index, letter) => {
    setSwapGroups([...swapGroups.slice(0, index), ...swapGroups.slice(index + 1)])
  }

  const addSwapGroup = (letters) => {
    setSwapGroups([makeSwapGroup(letters), ...swapGroups])
  }

  return (
    <div className="main">
      <div className="controls">
        <input onChange={(e) => { setToAnagram(e.target.value) }} value={toAnagram} />
        <button onClick={() => dispatch({ type: 'clearCandidates' })}>Start</button>
        <button onClick={() => setSwapMenuOpen(!swapMenuOpen)}>{swapMenuOpen ? 'Close' : 'Swaps'}</button>
        {swapMenuOpen && (
          <SwapMenu
            swapGroups={swapGroups}
            updateSwapGroup={updateSwapGroup}
            removeSwapGroup={removeSwapGroup}
            addSwapGroup={addSwapGroup}
          />
        )}
      </div>
      <div className="results">
        {sortCandidates(candidatesTree.children).map((candidate) => {
          return <Branch key={makeCandidateKey(candidate)} path={candidate.word} candidate={candidate} candidatesTreeDispatch={dispatch} />
        })}
      </div>
    </div>
  )
}
