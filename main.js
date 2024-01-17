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

const wordTree = {}
allWords.forEach((word) => {
  const sortedLetters = word.split('').sort()
  let current = wordTree
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

button.addEventListener('click', () => {
  const val1 = document.getElementById('anagramsonsteroids').value;
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

  const sortedLetters = val1.split('').sort()

  const candidates = getCandidates(sortedLetters, wordTree, swapGroups)

  const results = candidates
    .map(({ word, remainder }) => `${word}: ${remainder}`)
  outputElement.innerHTML = ''
  outputElement.innerHTML = JSON.stringify(
    results,
    null,
    2
  );
})

function getCandidates (remainingLetters, currentNode, swapGroups, currentLetters = []) {
  const candidates = []

  if (!currentNode) return []

  if (currentNode.words && currentNode.words.length) {
    candidates.push(...currentNode.words.map((word) => ({ word, remainder: remainingLetters.join('') })))
  }

  if (!remainingLetters.length) return candidates

  const searched = []
  
  for (let i = 0, len = remainingLetters.length; i < len; i++) {
    const letter = remainingLetters[i]
    const rem = remainingLetters.filter((_, ind) => ind !== i)
    while (i < len && remainingLetters[i + 1] === letter) {
      i++
    }

    const swaps = [ ...(new Set([ ...swapGroups, [letter] ].filter(group => group.includes(letter)).reduce((acc, group) => [...group, ...acc], []))) ]
    swaps.forEach((swapLetter) => {
      const curr = [ ...currentLetters, swapLetter ]
      const cand = getCandidates(rem, currentNode[swapLetter], swapGroups, curr)

      candidates.push(...cand)
    })
  }

  return candidates
}

