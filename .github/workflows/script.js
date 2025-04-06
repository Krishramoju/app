const video = document.getElementById('video');
const emotionText = document.getElementById('emotion');
const player = document.getElementById('player');

const musicMap = {
  happy: 'music/happy.mp3',
  sad: 'music/sad.mp3',
  angry: 'music/angry.mp3',
  neutral: 'music/neutral.mp3'
};

let currentEmotion = "";

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

async function detectEmotion(model) {
  const predictions = await model.estimateFaces({ input: video });

  if (predictions.length > 0) {
    const keypoints = predictions[0].keypoints;

    // Use keypoint indexes
    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const topLip = keypoints[13];
    const bottomLip = keypoints[14];
    const leftEye = keypoints[159];
    const rightEye = keypoints[386];

    const mouthWidth = Math.hypot(rightMouth.x - leftMouth.x, rightMouth.y - leftMouth.y);
    const mouthHeight = Math.hypot(topLip.y - bottomLip.y, topLip.x - bottomLip.x);
    const eyeDistance = Math.hypot(leftEye.y - rightEye.y, leftEye.x - rightEye.x);

    let emotion = "neutral";

    if (mouthHeight > 10 && mouthWidth > 50) {
      emotion = "happy";
    } else if (mouthHeight < 6 && mouthWidth < 45) {
      emotion = "sad";
    } else if (eyeDistance < 5) {
      emotion = "angry";
    }

    if (emotion !== currentEmotion) {
      currentEmotion = emotion;
      emotionText.innerText = `Emotion: ${emotion}`;
      player.src = musicMap[emotion];
    }
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

