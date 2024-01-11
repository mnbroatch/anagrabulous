function countLetters (str) {
  const map = {};
  str.split('').forEach((letter) => {
    if (!map[letter]) {
      map[letter] = 1;
    } else {
      map[letter]++;
    }
  })
  return map;
}

function getDiff (str1, str2) {
  const str1Chars = countLetters(str1);
  const str2Chars = countLetters(str2);

  Object.entries(str2Chars).forEach(([letter, count]) => {
    if (str1Chars[letter] === undefined) str1Chars[letter] = 0;
    str1Chars[letter] -= count;
  })

  return str1Chars;
}

function getRemainder (diff) {
  let toReturn = ''
  Object.entries(diff).forEach(([letter, count]) => {
    for (let i = count; i > 0; i--) {
      toReturn += letter;
    }
  })
  return toReturn;
}

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
    letterControl.classList.add('swap-group-checkbox-letter')
    checkbox.type = 'checkbox'
    checkbox.checked = true
    letterControl.appendChild(checkboxLabel)
    letterControl.appendChild(checkbox)
    checkboxControl.appendChild(letterControl)
  }

  checkboxContainer.appendChild(checkboxControl)

}


button.addEventListener('click', () => {
  const val1 = document.getElementById('anagramsonsteroids').value;
  const letters = countLetters(val1);
  const outputElement = document.getElementById('output');

  const checkboxes = [ ...document.getElementsByClassName('swap-group-checkbox') ]
  const swapGroups = swaps.filter((_, index) => checkboxes[index].checked);


  let candidates = allWords
  .filter(word => word.length <= val1.length)
  .map((word) => {
    return [ word, getDiff(val1, word) ]
  })
  .filter(([ word, diff ]) => {
    let count = 0
    Object.entries(diff).forEach(([letter, val]) => {
      const swapGroup = swapGroups.find(group => group.includes(letter))
      if (diff[letter] < 0 && swapGroup) {
        for (let swappedLetter of swapGroup) {
          if (letter !== swappedLetter && diff[swappedLetter] > 0 && diff[letter] < 0) {
            diff[swappedLetter]--
            diff[letter]++
            if (diff[letter] >= 0) {
              break
            }
          }
        }
      }
    })
    return !Object.values(diff).some(val => val < 0)
  });
  const results = candidates
  .sort((a, b) => {
    return b[0].length - a[0].length
  })
  .map(([word, diff ]) => {
    return `${word}: ${getRemainder(diff)} `
  })
  outputElement.innerHTML = ''
  outputElement.innerHTML = JSON.stringify(
    results,
    null,
    2
  );
})