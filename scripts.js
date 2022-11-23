const VideoSDK = window.WebVideoSDK.default

let zmClient = VideoSDK.createClient()
let zmStream

// setup your signature endpoint here: https://github.com/zoom/videosdk-sample-signature-node.js
let signatureEndpoint = 'https://videosdk-sample-signature.herokuapp.com'
let sessionName = 'screenshare'
let sessionPasscode = 'zoom123'
let userName = 'Participant' + Math.floor(Math.random() * 100)
let role = 1
let userIdentity
let sessionKey

zmClient.init('US-en', 'CDN')

function getSignature() {

  fetch(signatureEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionName: sessionName,
      role: role,
      userIdentity: userIdentity,
      sessionKey: sessionKey
    })
  }).then((response) => {
    return response.json()
  }).then((data) => {
    joinSession(data.signature)
  }).catch((error) => {
  	console.log(error)
  })
}

function joinSession(signature) {
  zmClient.join(sessionName, signature, userName, sessionPasscode).then((data) => {
    zmStream = zmClient.getMediaStream()
  }).catch((error) => {
    console.log(error)
  })
}

function leaveSession() {
  zmClient.leave()
}

function startScreenShare() {
  let cameras = zmStream.getCameraList()
  console.log(cameras)

  if(typeof MediaStreamTrackProcessor === 'function') {
    zmStream.startShareScreen(document.querySelector('#my-screen-share-video'))
  } else {
    zmStream.startShareScreen(document.querySelector('#my-screen-share-canvas'))
  }
}

function stopScreenShare() {
  zmStream.stopShareScreen()
}

zmClient.on('active-share-change', (payload) => {

  console.log(payload)

  var interval

  function ifZmStream() {
  if(zmStream) {
    clearInterval(interval)
      if (payload.state === 'Active') {
        zmStream.startShareView(document.querySelector('#screen-share-canvas'), payload.userId)
      } else if (payload.state === 'Inactive') {
        zmStream.stopShareView()
      }
    }
  }

  interval = setInterval(ifZmStream, 1000)
})

zmClient.on('share-audio-change', (payload) => {
  if (payload.state === 'on') {
    console.log('Switched to Share Chrome Tab Audio')
  } else if(payload.state === 'off') {
    console.log('Switched to your microphone')
  }
})
