const button = document.getElementById('do-thing');
const checkboxContainer = document.getElementById('checkboxes');
for (let swapGroup of swaps) {
  const checkboxControl = document.createElement('div')
  const checkbox = document.createElement('input')
  checkboxControl.classList.add('swap-group-checkbox-control')
  checkbox.classList.add('swap-group-checkbox')
  checkbox.type = 'checkbox'
  checkbox.checked = false

  checkboxControl.appendChild(checkbox)

  for (let letter of swapGroup) {
    const letterControl = document.createElement('div')
    const checkboxLabel = document.createElement('div')
    checkboxLabel.innerHTML = letter
    const checkbox = document.createElement('input')
    checkbox.dataset.letter = letter
    letterControl.classList.add('swap-group-checkbox-letter-control')
    checkbox.type = 'checkbox'
    checkbox.checked = true
    checkbox.classList.add('swap-group-checkbox-letter')
    letterControl.appendChild(checkboxLabel)
    letterControl.appendChild(checkbox)
    checkboxControl.appendChild(letterControl)
  }

  checkboxContainer.appendChild(checkboxControl)
}

const wordTree = makeWordTree(allWords)

function makeWordTree (words) {
  const toReturn = {}
  words.forEach((word) => {
    const sortedLetters = word.split('').sort()
    let current = toReturn
    const length = word.length
    sortedLetters.forEach((letter, i) => {
      if (!current[letter]) {
        current[letter] = {}
      }
      current = current[letter] 
      if (i === length - 1) {
        if (!current.words) {
          current.words = []
        }
        current.words.push(word)
      }
    })
  })

  return toReturn
}

button.addEventListener('click', () => {
  const start = Date.now()
  const val1 = document.getElementById('anagramsonsteroids').value;
  const val2 = document.getElementById('verification').value;
  const outputElement = document.getElementById('output');
  const isMulti = !val2 && document.getElementById('is-multi-checkbox').checked;

  const checkboxes = [ ...document.getElementsByClassName('swap-group-checkbox') ]
  const checkboxGroups = [ ...document.getElementsByClassName('swap-group-checkbox-control') ]

  const swapGroups = swaps
    .map((group, index) => {
      const groupElement = checkboxGroups[index]
      const letterCheckboxes = [ ...groupElement.getElementsByClassName('swap-group-checkbox-letter') ]
      return group.filter((_, index) => letterCheckboxes[index].checked)
    })
    .filter((group, index) => checkboxes[index].checked && group.length > 0)

  const swapMap = {}
  swapGroups.forEach((group) => {
    group.forEach((letter) => {
      swapMap[letter] = [ ...(new Set([...group, ...(swapMap[letter] || [])])) ]
    })
  })

  const normalizedLetterObjects = getNormalizedLetterObjects(val1, swapMap)

  const tree = val2 ? makeWordTree([val2]) : wordTree
  const initialCandidates = getCandidates(normalizedLetterObjects, tree, swapMap)
  const candidates = isMulti
    ? initialCandidates 
      .map(cand => {
        const wordLetterObjects = getNormalizedLetterObjects(cand.word, swapMap)
        const remainderLetterObjects = getNormalizedLetterObjects(formatRemainder(cand.remainingLetterObjects), swapMap)
        const remainderCandidates = getCandidates(remainderLetterObjects, tree, swapMap, wordLetterObjects)
        return remainderCandidates.map(candidate => [cand, candidate])
      })
      .reduce((acc, c) => [ ...acc, ...c ], [])
    : initialCandidates.map(cand => [cand])

  console.log('candidates', candidates)

  const results = formatResults(candidates, val1)
  outputElement.innerHTML = ''
  outputElement.innerHTML = JSON.stringify(
    results,
    null,
    2
  );
  console.log('Date.now() - start', Date.now() - start)
})

function getNormalizedLetterObjects (val1, swapMap) {
  return val1.split('').map(letter => {
    const swapGroup = swapMap[letter]
    const swapLetter = swapGroup ? swapGroup[0] : letter
    return {
      letter: swapLetter,
      originalLetter: letter
    }
  })
  .sort((a, b) => a.letter > b.letter ? 1 : -1)
}

function formatResults (candidates, value) {
  return candidates
    .sort((a, b) => {
      const aWord = a.map(l => l.word).reduce((acc, w) => acc + w, '')
      const bWord = b.map(l => l.word).reduce((acc, w) => acc + w, '')
      if (aWord.length === bWord.length) {
        return aWord < bWord ? -1 : 1
      } else {
        return aWord.length > bWord.length ? -1 : 1
      }
    })
    .map(words => `${words.map(formatWord).join(' ')}: ${formatRemainder(words[words.length - 1].remainingLetterObjects)}`)
}

function formatWord (word) {
  const letterObjectsCopy = [...word.currentLetterObjects]
  const letters = word.word.split('')
  const sortedLetterObjects = []
  letters.forEach((letter) => {
    const index = letterObjectsCopy.findIndex((lo => lo.letter === letter))
    sortedLetterObjects.push(letterObjectsCopy[index])
    letterObjectsCopy.splice(index, 1)
  })
  return sortedLetterObjects.reduce((acc, letter) => acc + (letter.originalLetter === letter.letter
    ? letter.letter
    : `<span class=swapped-letter>${letter.letter}</span>`)
  , '')
}

function getCandidates (remainingLetterObjects, currentNode, swapMap, previousWordLetterObjects, currentLetterObjects = []) {
  const candidates = []

  if (!currentNode) return []

  if (currentNode.words && currentNode.words.length) {
    candidates.push(...currentNode.words.map((word) => ({ word, currentLetterObjects, remainingLetterObjects })))
  }

  if (!remainingLetterObjects.length) return candidates

  for (let i = 0, len = remainingLetterObjects.length; i < len; i++) {
    const letterObject = remainingLetterObjects[i]

    const rem = remainingLetterObjects.filter((_, ind) => ind !== i)

    while (i < len && remainingLetterObjects[i + 1] && remainingLetterObjects[i + 1].letter === letterObject.letter) {
      i++
    }

    // when implementing multiple words, to solve "dog cat" vs "cat dog", we need to make sure a given candidate
    // never looks for a word out of alphabetical order from the last.

    const swaps = swapMap[letterObject.letter] || [letterObject.letter]
    swaps.forEach((swapLetter) => {
      const curr = [ ...currentLetterObjects, { letter: swapLetter, originalLetter: letterObject.originalLetter } ]
      if (previousWordLetterObjects && curr.map(l => l.letter).join('') > previousWordLetterObjects.map(l => l.letter).join('')) return
      const cand = getCandidates(rem, currentNode[swapLetter], swapMap, previousWordLetterObjects, curr)
      candidates.push(...cand)
    })
  }

  return candidates
}

function formatRemainder (remainingLetterObjects) {
  return remainingLetterObjects.map(letterObject => letterObject.originalLetter).join('')
}
