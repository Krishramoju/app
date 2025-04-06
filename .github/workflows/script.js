const video = document.getElementById("video");
const emotionText = document.getElementById("emotion");
const player = document.getElementById("player");

const musicMap = {
  happy: "music/happy.mp3",
  sad: "music/sad.mp3",
  angry: "music/angry.mp3",
  neutral: "music/neutral.mp3"
};

let currentEmotion = "";

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

function calculateDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function inferEmotion(keypoints) {
  const leftMouth = keypoints[61];
  const rightMouth = keypoints[291];
  const topLip = keypoints[13];
  const bottomLip = keypoints[14];
  const leftEye = keypoints[159];
  const rightEye = keypoints[386];

  const mouthWidth = calculateDistance(leftMouth, rightMouth);
  const mouthHeight = calculateDistance(topLip, bottomLip);
  const eyeHeight = calculateDistance(leftEye, rightEye);

  if (mouthHeight > 10 && mouthWidth > 60) return "happy";
  if (mouthHeight < 6 && mouthWidth < 50) return "sad";
  if (eyeHeight < 6) return "angry";
  return "neutral";
}

async function detectEmotion(model) {
  const predictions = await model.estimateFaces({ input: video });

  if (predictions.length > 0) {
    const keypoints = predictions[0].keypoints;
    const detectedEmotion = inferEmotion(keypoints);

    if (detectedEmotion !== currentEmotion) {
      currentEmotion = detectedEmotion;
      emotionText.innerText = `Emotion: ${detectedEmotion}`;
      player.src = musicMap[detectedEmotion];
      player.play();
    }
  } else {
    emotionText.innerText = "No face detected";
  }
}

async function main() {
  await setupCamera();
  const model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  );
  setInterval(() => detectEmotion(model), 2000);
}

main();


