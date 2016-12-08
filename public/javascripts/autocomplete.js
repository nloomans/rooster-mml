/* global USERS */

const fuzzy = require('fuzzy')
const search = require('./search')

const self = {}

self._items = []
self._selectedItemIndex = -1

self._nodes = {
  form: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
}

self.getSelectedItem = function () {
  if (self.getItems() === []) return

  if (self.getSelectedItemIndex() === -1) {
    return self.getItems()[0]
  } else {
    return self.getItems()[self.getSelectedItemIndex()]
  }
}

self.getSelectedItemIndex = function () {
  return self._selectedItemIndex
}

self.getItems = function () {
  return self._items
}

self._removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild)
  }
  self._items = []
  self._selectedItemIndex = -1
}

self._addItem = function (item) {
  const listItem = document.createElement('li')
  listItem.textContent = item.value
  listItem.addEventListener('click', self._handleItemClick)
  self._nodes.autocomplete.appendChild(listItem)
  self._items.push(item)
}

self._moveSelected = function (shift) {
  if (self._selectedItemIndex + shift >= self.getItems().length) {
    self._selectedItemIndex = -1
  } else if (self._selectedItemIndex + shift < -1) {
    self._selectedItemIndex = self.getItems().length - 1
  } else {
    self._selectedItemIndex += shift
  }

  for (let i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected')
  }
  if (self._selectedItemIndex >= 0) {
    self._nodes.autocomplete
        .children[self._selectedItemIndex].classList.add('selected')
  }
}

self._calculate = function (searchTerm) {
  const allResults = fuzzy.filter(searchTerm, USERS, {
    extract: item => item.value
  })
  const firstResults = allResults.slice(0, 7)

  const originalResults = firstResults.map(result => result.original)

  return originalResults
}

self._handleItemClick = function (event) {
  const itemIndex = Array.prototype.indexOf
      .call(self._nodes.autocomplete.children, event.target)
  console.log(itemIndex)
  self._selectedItemIndex = itemIndex
  console.log(search)
  search.submit()
}

self._handleFocus = function () {
  self._nodes.autocomplete.style.display = 'block'
}

self._handleBlur = function (event) {
  // console.log(document.querySelector(':focus'))
  // if (event.target.parentNode === self._nodes.autocomplete) return
  // self._nodes.autocomplete.style.display = 'none'
}

self._handleTextUpdate = function () {
  const results = self._calculate(self._nodes.input.value)

  self._removeAllItems()
  for (let i = 0; i < results.length; i++) {
    self._addItem(results[i])
  }
}

self._handleKeydown = function (event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (event.key === 'ArrowDown') {
      self._moveSelected(1)
    } else if (event.key === 'ArrowUp') {
      self._moveSelected(-1)
    }
  }
}

self._nodes.input.addEventListener('focus', self._handleFocus)
self._nodes.input.addEventListener('blur', self._handleBlur)
self._nodes.input.addEventListener('input', self._handleTextUpdate)
self._nodes.input.addEventListener('keydown', self._handleKeydown)

module.exports = self
