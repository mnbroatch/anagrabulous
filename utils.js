import { produce } from 'immer'

export function makeSwapGroup (letters) {
  return {
    enabled: true,
    letters: letters.map(letter => ({
      letter,
      enabled: true
    }))
  }
}

export function makeSwapMap (swapGroups) {
  const filteredSwapGroups = swapGroups
    .filter((swapGroup) => swapGroup.enabled)
    .map(swapGroup => swapGroup.letters.filter(letterObject => letterObject.enabled).map(letterObject => letterObject.letter))
    .filter((swapGroup) => swapGroup.length)

  const swapMap = {}
  filteredSwapGroups.forEach((group) => {
    group.forEach((letter) => {
      swapMap[letter] = [...(new Set([...group, ...(swapMap[letter] || [])]))]
    })
  })
  return swapMap
}

export function makeWordTree (words) {
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

export function getNormalizedLetterObjects (val1, swapMap) {
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

export function getCandidates (wordTree, cache, remainingLetterObjects, currentNode, swapMap, previousWordLetterObjects, currentLetterObjects = []) {
  const letters = remainingLetterObjects.map(o => o.letter).join('')
  if (currentNode === wordTree && letters in cache) {
    return cache[letters]
  }

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

    const swaps = swapMap[letterObject.letter] || [letterObject.letter]
    swaps.forEach((swapLetter) => {
      const curr = [...currentLetterObjects, { letter: swapLetter, originalLetter: letterObject.originalLetter }]
      if (previousWordLetterObjects && curr.map(l => l.letter).join('') > previousWordLetterObjects.map(l => l.letter).join('')) return
      const cand = getCandidates(wordTree, cache, rem, currentNode[swapLetter], swapMap, previousWordLetterObjects, curr)
      candidates.push(...cand)
    })
  }

  if (currentNode === wordTree) {
    cache[letters] = candidates
  }

  // todo: can we avoid these dupes from the start?
  const dedupeMap = new Map()
  candidates.forEach(c => dedupeMap.set(makeCandidateKey(c), c))
  return Array.from(dedupeMap.values())
}

export function formatRemainder (remainingLetterObjects) {
  return remainingLetterObjects.map(letterObject => letterObject.originalLetter).join('')
}

export function addToCandidatesTree (path, newCandidates, candidatesTree) {
  return produce(candidatesTree, draft => {
    const candidate = path
      ? path.split('.').reduce((acc, segment) => acc.children.find(c => c.word === segment), draft)
      : draft
    candidate.children = newCandidates
  })
}

export function sortCandidates (candidates = []) {
  return [...candidates].sort((a, b) => {
    if (a.word.length > b.word.length) {
      return -1
    } else if (a.word.length < b.word.length) {
      return 1
    } else {
      return a.word < b.word ? -1 : 1
    }
  })
}

export function sortLetterObjects (letterObjects, word) {
  const letterObjectsCopy = [...letterObjects]
  const letters = word.split('')
  const sortedLetterObjects = []
  letters.forEach((letter) => {
    const index = letterObjectsCopy.findIndex(lo => lo.letter === letter)
    sortedLetterObjects.push(letterObjectsCopy[index])
    letterObjectsCopy.splice(index, 1)
  })
  return sortedLetterObjects
}

export function makeCandidateKey (candidate) {
  return candidate.word + '-' + candidate.remainingLetterObjects.map((l) => l.originalLetter).join('')
}
