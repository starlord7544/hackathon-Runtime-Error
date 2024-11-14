const video = document.getElementById('video')
let faceMatcher;

const labeledDescriptors = [];




Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.querySelector('.video-container').append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    if (faceMatcher) {
      resizedDetections.forEach(detection => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
        drawBox.draw(canvas);
      });
    }
  }, 100)
})

function registerPerson() {
  const studentId = document.getElementById('student-id').value;
  const label = `${studentId}`;

  if (!studentId) {
    alert("Please enter both Student ID and Name.");
    return;
  }
  registerFace(label);
}


function saveDescriptors(descriptors) {
  const data = descriptors.map(ld => ({
    label: ld.label,
    descriptors: ld.descriptors.map(descriptor => Array.from(descriptor)),
  }));
  uploadFaceDetails(data);
}





async function uploadFaceDetails(data) {
  try {
    const response = await fetch('http://localhost:6969/v1/faceDetails/updateFaceData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to upload face details');
    }

    const result = await response.json();
    console.log('Face details uploaded successfully:', result);

  } catch (error) {
    console.error('Error uploading face details:', error);
    // alert('Error uploading face details, try again:', error);
  }
}


function loadDescriptorsFromJSON(jsonData) {
  const data = JSON.parse(jsonData);
  labeledDescriptors.push(
    ...data.map(d => new faceapi.LabeledFaceDescriptors(
      d.label,
      d.descriptors.map(descriptor => new Float32Array(descriptor))
    ))
  );
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
}


async function registerFace(label) {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (detection && detection.detection.score >= 0.7) { // Check if confidence score is at least 70%
    const descriptor = detection.descriptor;
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(label, [descriptor]);
    labeledDescriptors.push(labeledDescriptor);

    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    console.log(`Registered face for ${label} with confidence score of ${detection.detection.score}`);
    saveDescriptors(labeledDescriptors);
    // window.location.href = 'attendance.html';
  } else {
    console.log("Face not detected with high enough confidence. Please ensure your face is clearly visible to the camera.");
    alert("Face not detected with high enough confidence. Please ensure your face is clearly visible to the camera.");
  }
}
