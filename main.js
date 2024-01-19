const button = document.getElementById('do-thing');
const checkboxContainer = document.getElementById('checkboxes');
for (let swapGroup of swaps) {
  const checkboxControl = document.createElement('div')
  const checkbox = document.createElement('input')
  checkboxControl.classList.add('swap-group-checkbox-control')
  checkbox.classList.add('swap-group-checkbox')
  checkbox.type = 'checkbox'
  checkbox.checked = true

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

function normalizeSwaps (letters, swapMap) {
  return letters.map(letter => {
    const swapGroup = swapMap[letter]
    return swapGroup ? swapGroup[0] : letter
  })
}

button.addEventListener('click', () => {
  const start = Date.now()
  const val1 = document.getElementById('anagramsonsteroids').value;
  const val2 = document.getElementById('verification').value;
  const outputElement = document.getElementById('output');

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

  const normalizedLetterObjects = normalizeSwaps(val1.split(''), swapMap)
    .map((letter, index) => ({ letter, index }))
    .sort((a, b) => a.letter > b.letter ? 1 : -1)

  const tree = val2 ? makeWordTree([val2]) : wordTree
  const candidates = getCandidates(normalizedLetterObjects, tree, swapMap)
  const words = candidates.map(w => w.word).sort()
  console.log('words', words)

  const results = formatResults(candidates, val1)
  outputElement.innerHTML = ''
  outputElement.innerHTML = JSON.stringify(
    results,
    null,
    2
  );
  console.log('Date.now() - start', Date.now() - start)
})

function formatResults (candidates, value) {
  return candidates
    .sort((a, b) => {
      if (a.word.length === b.word.length) {
        return a.word < b.word ? -1 : 1
      } else {
        return a.word.length > b.word.length ? -1 : 1
      }
    })
    .map(({ word, remainingLetterObjects }) => `${word}: ${formatRemainder(remainingLetterObjects, value)}`)
}

function getCandidates (remainingLetterObjects, currentNode, swapMap, currentLetters = []) {
  const candidates = []

  if (!currentNode) return []

  if (currentNode.words && currentNode.words.length) {
    candidates.push(...currentNode.words.map((word) => ({ word, remainingLetterObjects })))
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
      const curr = [ ...currentLetters, swapLetter ]
      const cand = getCandidates(rem, currentNode[swapLetter], swapMap, curr)
      candidates.push(...cand)
    })
  }

  return candidates
}

function formatRemainder (remainingLetterObjects, value) {
  return remainingLetterObjects.map(letterObject => value[letterObject.index]).join('')
}
