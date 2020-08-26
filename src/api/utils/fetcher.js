const fetch = require('node-fetch')

const fetchLinkBody = async (route, body, method) => {
  let result
  await fetch(route, {
    method,
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => result = res.json())
  return result
}

const fetchLink = async (route, method) => {
  let result
  await fetch(route, {
    method,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => result = res.json())
  return result
}

module.exports = { fetchLinkBody, fetchLink }
