const video = document.getElementById("video");
const emotionLabel = document.getElementById("emotion-label");
const musicPlayer = document.getElementById("music-player");
const musicSrc = document.getElementById("music-src");

// Emotion to music mapping
const musicMap = {
  happy: "music/happy.mp3",
  sad: "music/sad.mp3",
  angry: "music/angry.mp3",
  neutral: "music/neutral.mp3",
  surprised: "music/happy.mp3",
  disgusted: "music/neutral.mp3",
  fearful: "music/sad.mp3"
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Camera access error: ", err));
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceExpressions();

    const resized = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);

    if (detections[0]) {
      const expressions = detections[0].expressions;
      const maxEmotion = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      emotionLabel.textContent = `Detected Emotion: ${maxEmotion}`;

      // Only change song if it's different
      const currentSrc = musicSrc.getAttribute("src");
      const newSrc = musicMap[maxEmotion] || musicMap["neutral"];
      if (currentSrc !== newSrc) {
        musicSrc.setAttribute("src", newSrc);
        musicPlayer.load();
      }
    }
  }, 3000);
});
