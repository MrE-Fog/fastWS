const Replicator = require('replicator')
const BasicProtocol = require('./basic')
const ServerError = require('../errors')

const PING = '\x0F'
const PONG = '\x0E'
const DATA_START = '\x01'
const DATA_END = '\x02'
const EVENT = '\x05'
const RESPONSE = '\x06'
const IDLE = '\x16'

const eventId = (str) => str.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0).toString(16)

class Parser {
  constructor (options) {
    this.replicator = new Replicator(options)
  }

  parse (payload) {
    if (payload[0] === DATA_START && payload[payload.length - 1] === DATA_END) {
      return { type: 'message', data: this.replicator.decode(payload.slice(1, -1)) }
    } else if (payload[0] === PING) {
      return { type: 'ping', data: Number(payload.slice(1)) }
    } else if (payload[0] === PONG) {
      return { type: 'pong', data: new Date() - Number(payload.slice(1)) }
    } else if (payload[0] === EVENT) {
      const eventSplitIndex = payload.indexOf(IDLE)
      const replySplitIndex = payload.indexOf(DATA_START)
      if (eventSplitIndex === -1 || replySplitIndex === -1) {
        throw new ServerError({ code: 'WS_INVALID_PAYLOAD' })
      }
      const event = payload.slice(1, eventSplitIndex)
      const replyId = payload.slice(eventSplitIndex + 1, replySplitIndex)
      const dataPayload = payload.slice(replySplitIndex)
      return {
        type: 'event',
        name: event,
        reply_id: replyId,
        data: this.parse(dataPayload).data
      }
    } else {
      throw new Error('Invalid payload')
    }
  }

  stringify (data, type = 'message') {
    if (type === 'reply') {
      return RESPONSE + data.replyId + this.stringify(data.data)
    } else if (type === 'event') {
      return EVENT + eventId(data.event) + this.stringify(data.data)
    } else if (type === 'ping') {
      return PING + new Date().valueOf().toString()
    } else if (type === 'pong') {
      return PONG + data.toString()
    } else if (type === 'message') {
      return DATA_START + this.replicator.encode(data) + DATA_END
    } else {
      throw new Error('Invalid type')
    }
  }
}

class WSClient extends BasicProtocol.WSClient {
  constructor (connection, parser) {
    super(connection, { parser })
  }

  onOpen (socket) {
    super.onOpen(socket)
    this.doSend('\x00\x02', 0, 0)
  }

  reply (replyId, data) {
    this.doSend(this.parser.stringify({ replyId, data }, 'reply'))
  }

  incomingPacket (payload, isBinary) {
    if (isBinary) {
      super.emit('binary', payload)
    } else {
      const data = this.parser.parse(payload.toString(), isBinary)
      if (data.type === 'event') {
        data.reply = this.reply.bind(this, data.reply_id)
        super.emit(data.name, data)
      } else {
        if (data.type === 'ping') {
          this.doSend(this.parser.stringify(data.data, 'pong'))
        }
        super.emit(data.type, data.data)
      }
    }
  }

  ping () {
    this.doSend(this.parser.stringify(null, 'ping'))
  }

  on (event, listener) {
    if (this.internalEvents.includes(event)) {
      super.on(event, listener)
    } else {
      super.on(eventId(event), listener)
    }
  }

  once (event, listener) {
    if (this.internalEvents.includes(event)) {
      super.once(event, listener)
    } else {
      super.once(eventId(event), listener)
    }
  }

  addListener (event, listener) {
    if (this.internalEvents.includes(event)) {
      super.addListener(event, listener)
    } else {
      super.addListener(eventId(event), listener)
    }
  }

  off (event, listener) {
    if (this.internalEvents.includes(event)) {
      super.off(event, listener)
    } else {
      super.off(eventId(event), listener)
    }
  }

  removeListener (event, listener) {
    if (this.internalEvents.includes(event)) {
      super.removeListener(event, listener)
    } else {
      super.removeListener(eventId(event), listener)
    }
  }

  removeAllListener (event) {
    if (this.internalEvents.includes(event)) {
      super.removeAllListener(event)
    } else {
      super.removeAllListener(eventId(event))
    }
  }

  emit (event, data, compress = true) {
    return this.doSend(this.parser.stringify({ event, data }, 'event'), false, compress)
  }

  emitToChannel (channel, event, data, compress = true) {
    this.doPublish(channel, this.parser.stringify({ event, data }, 'event'), false, compress)
  }
}

class WSProtocol extends BasicProtocol {
  constructor (options = {}) {
    super()
    this.parser = new Parser(options.parserOptions)
  }

  newClient (connection) {
    return new WSClient(connection, this.parser)
  }
}

module.exports = WSProtocol
