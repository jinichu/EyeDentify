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


    lobby.offer = (offer, resolve) => {
      navigator.getUserMedia({video:true}, (stream) => {
        const conn = new RTCPeerConnection(config)
        conn.addStream(stream)
        conn.onicecandidate = (ev) => {
          console.log('candidate', ev)
          if (!ev.candidate) {
            console.log('sending answer')
            resolve({Answer: encodeRSD(conn.localDescription)})
          }
        }
        conn.onconnecting = () => { console.log('connecting') }
        conn.onopen = () => { console.log('open') }
        conn.ondatachannel = (ev) => {
          console.log('data channel', ev)
        }

        console.log('got offer!', offer)
        conn.setRemoteDescription(decodeRSD(offer.Offer), () => {
          conn.createAnswer((offer) => {
            conn.setLocalDescription(offer, () => {}, error)
          }, error)
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

    this.reliable = this.conn.createDataChannel('reliable')

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
