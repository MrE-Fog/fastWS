const axios = require('axios')

module.exports = async function ({ HTTP_PORT }) {
  const res = await axios.get(`http://localhost:${HTTP_PORT}/stream/http`)
  if (res.status !== 200) {
    throw new Error(`Response ${res.status}`)
  }
  if (!res.headers['content-type']) {
    throw new Error('Unknown Content-Type')
  }
  if (!res.headers['content-length']) {
    throw new Error('Unknown Content-Length')
  }
  if (!res.data.match(/www\.google\.com/i)) {
    throw new Error('Response data mismatch')
  }
}
