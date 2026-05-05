// Minimal WebTransport client for realtime messaging
let transport = null
let connectPromise = null
let readerAbortController = null
let disconnecting = false

const messageListeners = new Set()
const stateListeners = new Set()

const toErrorMessage = (err) => (err && err.message) || "Không thể kết nối WebTransport"

const base64ToUint8Array = (base64) => {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

export async function connect(url) {
  if (connectPromise) return connectPromise
  if (transport) return

  if (typeof window === 'undefined' || !('WebTransport' in window)) {
    emitState('unsupported', 'Trình duyệt không hỗ trợ WebTransport')
    return
  }

  emitState('connecting')

  const WebTransportCtor = window.WebTransport

  connectPromise = (async () => {
    try {
      console.log('[WT-FE] connecting to:', url)

      const certHashBase64 = (import.meta.env.VITE_WEBTRANSPORT_CERT_HASH || '').trim()

      let t

      if (certHashBase64) {
        console.log('[WT-FE] using serverCertificateHashes')
        const hashArray = base64ToUint8Array(certHashBase64)
        t = new WebTransportCtor(url, {
          serverCertificateHashes: [
            {
              algorithm: 'sha-256',
              value: hashArray,
            },
          ],
        })
      } else {
        console.warn('[WT-FE] VITE_WEBTRANSPORT_CERT_HASH is missing, connecting without certificate hash')
        t = new WebTransportCtor(url)
      }

      transport = t
      disconnecting = false
      readerAbortController = new AbortController()

      // closed -> disconnected or error
      t.closed
        .then(() => {
          console.log('[WT-FE] transport closed')
          if (!disconnecting) emitState('disconnected')
        })
        .catch((err) => {
          console.log('[WT-FE] transport.closed error:')
          console.dir(err)
          if (!disconnecting) emitState('error', toErrorMessage(err))
        })

      await t.ready
      console.log('[WT-FE] connected')
      emitState('connected')

      const signal = readerAbortController.signal
      void consumeBidirectionalStreams(t, signal)
      void consumeUnidirectionalStreams(t, signal)
    } catch (err) {
      console.log('[WT-FE] connect failed:')
      console.dir(err)
      transport = null
      emitState('error', toErrorMessage(err))
      throw err
    } finally {
      connectPromise = null
    }
  })()

  return connectPromise
}

export async function disconnect() {
  disconnecting = true

  if (readerAbortController) {
    readerAbortController.abort()
    readerAbortController = null
  }

  if (connectPromise) {
    try {
      await connectPromise
    } catch (_) {
      // ignore
    }
  }

  const active = transport
  transport = null

  if (active?.close) {
    try {
      active.close()
    } catch (_) {
      // best-effort
    }
  }

  emitState('disconnected')
}

export async function reconnect(url) {
  await disconnect()
  await connect(url)
}

export function receive(listener) {
  messageListeners.add(listener)
  return () => messageListeners.delete(listener)
}

export function onMessage(listener) {
  return receive(listener)
}

export function onStateChange(listener) {
  stateListeners.add(listener)
  return () => stateListeners.delete(listener)
}

export async function send(payload) {
  if (!transport) throw new Error('WebTransport not connected')

  try {
    const writable = await transport.createUnidirectionalStream()
    const writer = writable.getWriter()
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
    const enc = new TextEncoder()
    await writer.write(enc.encode(text))
    await writer.close()
  } catch (err) {
    emitState('error', toErrorMessage(err))
    throw err
  }
}

function emitMessage(payload) {
  messageListeners.forEach((l) => {
    try {
      l(payload)
    } catch (_) {
      // listener errors are ignored
    }
  })
}

function emitState(state, detail) {
  stateListeners.forEach((l) => {
    try {
      l(state, detail)
    } catch (_) {
      // ignore
    }
  })
}

async function consumeBidirectionalStreams(t, signal) {
  if (!t?.incomingBidirectionalStreams) return

  const reader = t.incomingBidirectionalStreams.getReader()
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done || signal.aborted) break

      if (value?.readable) void consumeDataStream(value.readable, signal)
      if (value?.writable?.getWriter) {
        const w = value.writable.getWriter()
        try {
          await w.close()
        } catch (_) {}
      }
    }
  } catch (err) {
    if (!signal.aborted && !disconnecting) emitState('error', toErrorMessage(err))
  } finally {
    try { reader.releaseLock() } catch (_) {}
  }
}

async function consumeUnidirectionalStreams(t, signal) {
  if (!t?.incomingUnidirectionalStreams) return

  const reader = t.incomingUnidirectionalStreams.getReader()
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done || signal.aborted) break
      if (value) void consumeDataStream(value, signal)
    }
  } catch (err) {
    if (!signal.aborted && !disconnecting) emitState('error', toErrorMessage(err))
  } finally {
    try { reader.releaseLock() } catch (_) {}
  }
}

async function consumeDataStream(readable, signal) {
  const reader = readable.getReader()
  const chunks = []
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
  } catch (_) {
    return
  } finally {
    try { reader.releaseLock() } catch (_) {}
  }

  if (!chunks.length) return

  const merged = mergeChunks(chunks)
  const text = new TextDecoder().decode(merged).trim()
  if (!text) return

  try {
    emitMessage(JSON.parse(text))
  } catch {
    emitMessage(text)
  }
}

function mergeChunks(chunks) {
  let total = 0
  chunks.forEach((c) => (total += c.byteLength))
  const out = new Uint8Array(total)
  let off = 0
  chunks.forEach((c) => {
    out.set(c, off)
    off += c.byteLength
  })
  return out
}

const webTransport = { connect, disconnect, reconnect, receive, onMessage, send, onStateChange }
export default webTransport
