import React from 'react'
import PropTypes from 'prop-types'
import { formatRemainder, sortCandidates, sortLetterObjects, makeCandidateKey } from './utils'

Branch.propTypes = {
  candidate: PropTypes.object,
  path: PropTypes.string,
  previousCandidates: PropTypes.array,
  candidatesTreeDispatch: PropTypes.func
}

const MemoizedBranch = React.memo(Branch)

function Branch ({ path = '', candidate, candidatesTreeDispatch, previousCandidates = [] }) {
  return (
    <div className={['branch', !!candidate.children?.length && 'branch--with-children'].filter(Boolean).join(' ')}>
      <div className="label">
        <div className="candidates">
          {[...previousCandidates, candidate].map((c, i) => {
            const sortedLetterObjects = sortLetterObjects(c.currentLetterObjects, c.word)
            const candidateKey = makeCandidateKey(c)
            return <span key={candidateKey + i} className="candidate">
              {sortedLetterObjects.map((letterObject, i) => {
                return <span key={letterObject.letter + i} className={['letter', letterObject.letter !== letterObject.originalLetter && 'letter--swapped'].filter(Boolean).join(' ')}>
                  {letterObject.letter}
                </span>
              })}
            </span>
          })}
        </div>
        <div className="remainder">
          {!!candidate.remainingLetterObjects.length && `Remainder: ${formatRemainder(candidate.remainingLetterObjects)}`}
        </div>
      </div>
      {sortCandidates(candidate.children).map((c) => {
        const newPath = `${path}.${c.word}`
        return <Branch key={makeCandidateKey(c)} path={newPath} candidate={c} candidatesTreeDispatch={candidatesTreeDispatch} previousCandidates={[...previousCandidates, candidate]}/>
      })}
      {!candidate.children && !!candidate.remainingLetterObjects.length && <button className="continue-button" onClick={() => candidatesTreeDispatch({ type: 'addCandidates', path, candidate })}>Continue</button>}
    </div>
  )
}

export default MemoizedBranch
