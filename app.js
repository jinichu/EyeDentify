const keys = [
  { region: 'westcentralus', key: '06c348a76108436a97c449b092a66a2b' },
  { region: 'westcentralus', key: '2e71ec40048448f8b09884eef5020d58' },
  { region: 'westus', key: 'bbc52273720f4ae289fb4a8b966d8e08' },
  { region: 'westus', key: 'f6bb0b4d0ed043109b9d3f20a6d91618' },
  { region: 'westcentralus', key: '9d48cb80eeaf47e1b271351272ce1b38' },
  { region: 'westcentralus', key: 'a9c195950c5b41698914ec93fb0a8a75' },
]

class App {
  setup () {
    const zoneSize = 4
    this.video = document.getElementById('videoOut')
    const webCamFlow = new oflow.WebCamFlow(this.video, zoneSize)
    webCamFlow.startCapture()

    setInterval(() => {
      this.ocr()
    }, 1000)
  }

  randomKey () {
    return keys[Math.floor(Math.random() * keys.length)]
  }

  ocr () {
    const width = this.video.videoWidth
    const height = this.video.videoHeight
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d')
    this.ctx.drawImage(this.video, 0, 0)
    this.canvas.toBlob((blob) => {
      console.log(blob)
      var xhr = new XMLHttpRequest()
      const { key, region } = this.randomKey()
      xhr.open('POST', 'https://' + region + '.api.cognitive.microsoft.com/vision/v1.0/ocr', true)
      xhr.setRequestHeader("Content-Type", "application/octet-stream")
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", key)
      xhr.onload = function(e) {
        console.log(e)
        console.log(JSON.parse(e.target.response))
      }
      xhr.send(blob)
    })
  }
}

window.app = new App()
window.app.setup()
