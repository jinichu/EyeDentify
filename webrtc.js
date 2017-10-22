const config = {
  iceServers: [
    // STUN servers
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},

    // TURN servers
    // RTCIceServer typings is missing username.
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    }
  ]
};

if (!window.RTCPeerConnection) {
  window.RTCPeerConnection = window.webkitRTCPeerConnection
}

class WebRTCServer {
  constructor (localStream) {
    const lobby = document.querySelector("#lobby")
    document.querySelector("#lobbyID").innerText = lobby.token
    this.conn = new RTCPeerConnection(config)
    this.conn.addStream(localStream)
    this.conn.onicecandidate = (ev) => {
      console.log('candidate', ev)
    }
    this.conn.onconnecting = () => { console.log('connecting') }
    this.conn.onopen = () => { console.log('open') }
    lobby.offer = (offer, resolve) => {
      console.log('got offer!', offer)
      this.conn.setRemoteDescription(decodeRSD(offer.Offer), () => {
        this.conn.createAnswer((offer) => {
          console.log('sending asnwer')
          this.conn.setLocalDescription(offer, () => {}, error)
          resolve({Answer: encodeRSD(offer)})
        }, error)
      }, error)
    }
  }
}
function encodeRSD(rsd) {
  return JSON.stringify(rsd)
}

function decodeRSD(rsd) {
  return new RTCSessionDescription(JSON.parse(rsd))
}

class WebRTCClient {
  constructor (lobby, vid) {
    this.conn = new RTCPeerConnection(config)
    this.conn.onaddstream = (e) => {
      console.log('stream!!!!', e)
      vid.src = URL.createObjectURL(e.stream)
    }
    console.log('creating offer')
    this.conn.onicecandidate = (ev) => {
      console.log('candidate', ev)
      if (!ev.candidate) {
        document.querySelector("#lobbyList")
          .connect(lobby, encodeRSD(this.conn.localDescription), '')
          .then((resp) => {
            console.log('got resp', resp)
            this.conn.setRemoteDescription(decodeRSD(resp.Answer), () => {}, error)
          })
      }
    }

    this.conn.createOffer((offer) => {
      console.log('got local offer', offer)
      this.conn.setLocalDescription(offer, () => {}, error)
    }, error)

    this.conn.onconnecting = () => { console.log('connecting') }
    this.conn.onopen = () => { console.log('open') }
  }
}

function error (a, b, c) {
  console.log('error', a, b, c)
}
