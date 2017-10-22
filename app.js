class App {
  setup () {
    const zoneSize = 4
    this.video = document.getElementById('videoOut')
    const webCamFlow = new oflow.WebCamFlow(this.video, zoneSize)
    webCamFlow.startCapture()

    setInterval(() => {
      this.ocr()
    }, 10000)
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
      xhr.open('POST', 'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/ocr', true)
      xhr.setRequestHeader("Content-Type", "application/octet-stream")
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "06c348a76108436a97c449b092a66a2b")
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
