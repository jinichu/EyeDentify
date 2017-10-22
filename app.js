const keys = [
  { region: 'westcentralus', key: '06c348a76108436a97c449b092a66a2b' },
  { region: 'westcentralus', key: '2e71ec40048448f8b09884eef5020d58' },
  { region: 'westus', key: 'bbc52273720f4ae289fb4a8b966d8e08' },
  { region: 'westus', key: 'f6bb0b4d0ed043109b9d3f20a6d91618' },
  { region: 'westcentralus', key: '9d48cb80eeaf47e1b271351272ce1b38' },
  { region: 'westcentralus', key: 'a9c195950c5b41698914ec93fb0a8a75' },
  { region: 'westus2', key: '592600b67c864bad878281407dc4bd3d' },
  { region: 'westus2', key: 'fd86a9f3d88341b4885564b165186b48' },
  { region: 'southcentralus', key: 'd875495ec0b0429cbaa88602ea0aaebc' },
  { region: 'southcentralus', key: 'fb8fe0114487432696c5d25785b2c70e' },
]

class App {
  setup () {
    const zoneSize = 4
    this.video = document.getElementById('videoOut')
    const webCamFlow = new oflow.WebCamFlow(this.video, zoneSize)
    webCamFlow.startCapture()

    this.u = 0
    this.v = 0

    webCamFlow.onCalculated((direction) => {
      this.u += direction.u
      this.v += direction.v
    })

    setInterval(() => {
      this.ocr()
      console.log('optical flow', this.u, this.v)
    }, 2000)
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

    const {u, v} = this

    this.canvas.toBlob((blob) => {
      var xhr = new XMLHttpRequest()
      const { key, region } = this.randomKey()
      xhr.open('POST', 'https://' + region + '.api.cognitive.microsoft.com/vision/v1.0/ocr', true)
      xhr.setRequestHeader("Content-Type", "application/octet-stream")
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", key)
      xhr.onload = (e) => {
        console.log(JSON.parse(e.target.response))

        this.u -= u
        this.v -= v
      }
      xhr.send(blob)
    })
  }
}

window.app = new App()
window.app.setup()
