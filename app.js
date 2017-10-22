const keys = [
  { region: 'westcentralus', key: 'ab04da62b04e4f29aab971a912c52583' },
  { region: 'westcentralus', key: 'dbffc83786cb412d82d0f18f214eb2c8' },
]

class App {

  setup () {
    const zoneSize = 4
    this.video = document.getElementById('videoOut')
    const webCamFlow = new oflow.WebCamFlow(this.video, zoneSize)
    webCamFlow.startCapture();

    const canvas = document.querySelector('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.ctx = canvas.getContext('2d')

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

    this.zoom()

    this.setupWebRTC(webCamFlow)
  }

  setupWebRTC (webCamFlow) {
    const localStream = webCamFlow.localStream()
    if (!localStream) {
      setTimeout(() => {
        this.setupWebRTC(webCamFlow)
      }, 100)
      return
    }

    console.log(localStream)
    new WebRTCServer(localStream)
  }

  randomKey () {
    return keys[Math.floor(Math.random() * keys.length)]
  }

  ocr () {
    const width = this.video.videoWidth
    const height = this.video.videoHeight
    const midX = width / 2;
    const midY = height / 2;
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    const ctx = this.canvas.getContext('2d')
    ctx.drawImage(this.video, 0, 0)
    
    if (!this.mainObject) {
      this.mainObject = {
          "topLeft": {
              "x": 0,
              "y": 0
          },
          "bottomLeft": {
              "x": 0,
              "y": height
          },
          "topRight": {
              "x": width,
              "y": 0
          },
          "bottomRight": {
              "x": width,
              "y": height
          },
          "text": "",
          "width": width,
          "height": height
      }
    }

    const {u, v} = this

    this.canvas.toBlob((blob) => {
      var xhr = new XMLHttpRequest()
      const { key, region } = this.randomKey()
      xhr.open('POST', 'https://' + region + '.api.cognitive.microsoft.com/vision/v1.0/ocr', true)
      xhr.setRequestHeader("Content-Type", "application/octet-stream")
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", key)

      xhr.onload = (e) => {
        var mainObject = null;
        var mainLeft = null;
        var mainTop = null;
        var mainWidth = null;
        var mainHeight = null;
        var regions = [];
        var data = JSON.parse(e.target.response);
        for (var i = 0; i < data['regions'].length; i++) {
            var boundingBox = data['regions'][i]['boundingBox'].split(",");
            var left = parseInt(boundingBox[0]);
            var top = parseInt(boundingBox[1]);
            var w = parseInt(boundingBox[2]);
            var h = parseInt(boundingBox[3]);
            if (mainLeft == null && mainTop == null && mainWidth == null && mainHeight == null) {
                mainLeft = left;
                mainTop = top;
                mainWidth = w;
                mainHeight = h;
            }
            var currDist = Math.sqrt((midX - (mainLeft + mainWidth / 2))^2 + (midY - (mainTop + mainHeight / 2)^2));
            var dist = Math.sqrt((midX - (left + w / 2))^2 + (midY - (top + h / 2)^2));
            if (mainObject == null || currDist > dist) {
                var text = "";
                for (var j = 0; j < data['regions'][i]['lines'].length; j++) {
                    for (var k = 0; k < data['regions'][i]['lines'][j]['words'].length; k++) {
                        text = text.concat(data['regions'][i]['lines'][j]['words'][k]['text'] + " ");
                    }
                }
                mainLeft = left;
                mainTop = top;
                mainWidth = w;
                mainHeight = h;
                mainObject = {
                    "topLeft": {
                        "x": left,
                        "y": top
                    },
                    "bottomLeft": {
                        "x": left,
                        "y": top + h
                    },
                    "topRight": {
                        "x": left + w,
                        "y": top
                    },
                    "bottomRight": {
                        "x": left + w,
                        "y": top + h
                    },
                    "text": text,
                    "width": w,
                    "height": h
                }
            }
        }
        for (var i = 0; i < data['regions'].length; i++) {
            var boundingBox = data['regions'][i]['boundingBox'].split(",");
            var left = parseInt(boundingBox[0]);
            var top = parseInt(boundingBox[1]);
            var w = parseInt(boundingBox[2]);
            var h = parseInt(boundingBox[3]);
            if (left != mainLeft && top != mainTop && w != mainWidth && h != mainHeight) {
                var text = "";
                for (var j = 0; j < data['regions'][i]['lines'].length; j++) {
                    var words = data['regions'][i]['lines'][j];
                    for (var k = 0; k < words.length; i++) {
                        text.concat(words[k]['text'] + " ");
                    }
                }
                var region = {
                    "topLeft": {
                        "x": left,
                        "y": top
                    },
                    "bottomLeft": {
                        "x": left,
                        "y": top + h
                    },
                    "topRight": {
                        "x": left + w,
                        "y": top
                    },
                    "bottomRight": {
                        "x": left + w,
                        "y": top + h
                    },
                    "text": text,
                    "width": w,
                    "height": h
                }
                regions.push(region);
            }
        }
        //console.log(JSON.parse(e.target.response))
          console.log("DETECTED CENTER OBJECT IS: ")
          console.log(mainObject['text']);
          this.u -= u
          this.v -= v

        //this.setArrow(mainObject,regions);

        this.mainObject = mainObject;
        this.regions = regions;

      }
      xhr.send(blob)

      //make this into a button
      //setTimeout(this.resetZoom(), 5000);
    })
  }

  setArrow (target, targetArray) {
    var targetX = target.topLeft.x + target.width/2;
    var targetY = target.topLeft.y + target.height/2;
    var usedArray = [];
    var radius = 10000;
    targetArray.forEach((targetItem) => {
        if (!usedArray.includes(targetItem)) {
          var centerX = targetItem.topLeft.x + targetItem.width / 2;
          var centerY = targetItem.topLeft.y + targetItem.height / 2;
          var difX = centerX - targetX;
          var difY = centerY - targetY;
          var dist = Math.sqrt(difX * difX + difY * difY);
          if (dist < radius) {
            usedArray.push(targetItem);
            this.drawArrow({'x':targetX, 'y': targetY}, {'x': centerX, 'y': centerY});
          }
        }
    });
  }

  drawArrow (start, end) {
    console.log("HERE");
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = this.ctx.strokeStyle = '#0FF';
    this.ctx.save();
    /*
    var points = this.getEdges(start, end);
    if (points.length < 2) return;
    start = points[0];
    end = points[points.length - 1];
    */

    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var len = Math.sqrt(dx * dx + dy * dy) * 0.7;
    this.ctx.translate(end.x, end.y);
    this.ctx.rotate(Math.atan2(dy, dx));

    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(0,0);
    this.ctx.lineTo(-len,0);
    this.ctx.closePath();
    this.ctx.stroke();

    // arrowhead
    this.ctx.beginPath();
    this.ctx.moveTo(0,0);
    this.ctx.lineTo(-10,-10);
    this.ctx.lineTo(-10, 10);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
    /*
    this.ctx.moveTo(start.x, start.y)
    this.ctx.lineTo(end.x, end.y)
    this.ctx.stroke()
    */

  }

  getEdges(p1, p2, cutoff) {
    p1.x = Math.round(p1.x)
    p1.y = Math.round(p1.y)
    p2.x = Math.round(p2.x)
    p2.y = Math.round(p2.y)

    if (!cutoff) cutoff = 220; // alpha threshold
    var dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y),
      sx = p2.x > p1.x ? 1 : -1,  sy = p2.y > p1.y ? 1 : -1;
    var x0 = Math.min(p1.x,p2.x), y0=Math.min(p1.y,p2.y);
    var pixels = this.ctx.getImageData(x0, y0, dx + 1, dy + 1).data;
    var hits=[], over=null;
    for (var x=p1.x,y=p1.y,e=dx-dy; x!=p2.x||y!=p2.y;){
      var alpha = pixels[((y-y0)*(dx+1)+x-x0)*4 + 3];
      if (over!=null && (over ? alpha<cutoff : alpha>=cutoff)){
        hits.push({x:x,y:y});
      }
      var e2 = 2*e;
      if (e2 > -dy){ e-=dy; x+=sx }
      if (e2 <  dx){ e+=dx; y+=sy  }
      over = alpha>=cutoff;
    }
    return hits;

  }

  zoom () {
    window.requestAnimationFrame(() => {
      this.zoom()
    })
    const region = this.mainObject;
    var regions = [];
    if (this.regions) {
      for (var i = 0; i < this.regions.length; i++) {
        regions.push(this.regions[i]);
      }
    }
    if (!region) return;
    
    var zoomRatio = this.calculateRatio(region.width, region.height);
    var widthOffset = (region.topLeft.x + this.u) * -1;
    var heightOffset = (region.topLeft.y + this.v) * -1;

    this.video.style.transform = 'scale(' + zoomRatio + ',' + zoomRatio + ') translate3d(' + widthOffset + 'px,' + heightOffset + 'px,0)';

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    this.ctx.font = "100pt Arial";
    this.ctx.textAlign = 'center'
    this.ctx.fillText(region['text'], window.innerWidth/2, window.innerHeight/2);
    this.setArrow(region, regions);
    
  }

  calculateRatio(boxWidth, boxHeight) {
    var widthRatio = window.innerWidth / boxWidth;
    var heightRatio = window.innerHeight / boxHeight;
    //console.log("width: " + widthRatio + "   height: " + heightRatio)
    return Math.min(widthRatio, heightRatio) * 0.9;
  }

  resetZoom () {
      this.video.style.transform = "none";
  }
  
  
}




