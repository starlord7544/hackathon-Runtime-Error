const video = document.getElementById('video');
let faceMatcher;
let labeledDescriptors = [];
const studentAttendance = new Set();

// Load face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models')
]).then(startVideo);

// Start video stream
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

// Load descriptors from localStorage or file and initialize FaceMatcher
async function loadDescriptors() {
  try {
      // Fetch face data from the server via the /v1/faceDetails/getFaceData endpoint
      const response = await fetch('http://localhost:6969/v1/faceDetails/getFaceData', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',  // Ensure server expects and sends JSON
              'Host': 'localhost:6969',  // Specify the host
              'User-Agent': 'PostmanRuntime/7.42.O',  // Optional user-agent string
              'Accept': 'application/json',  // Accept JSON responses
              'Accept-Encoding': 'gzip, deflate, br',  // Specify accepted encodings
              'Connection': 'keep-alive'  // Keep connection alive for performance
          },
      });

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
          throw new Error(`Failed to fetch face data. Status: ${response.status}`);
      }

      // Parse the response as JSON
      const jsonData = await response.json();

      // Log the raw response for debugging
      console.log("Fetched Data:", jsonData);

      // Ensure the response is in the correct format (array of objects with label and descriptors)
      if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Map the data into LabeledFaceDescriptors format for FaceMatcher
           labeledDescriptors = jsonData.map(d => {
              // Check if each descriptor is an array and label exists
              if (d.label && Array.isArray(d.descriptors)) {
                  return new faceapi.LabeledFaceDescriptors(
                      d.label, // The label (person's name)
                      d.descriptors.map(descriptor => new Float32Array(descriptor)) // Convert descriptors to Float32Array
                  );
              } else {
                  console.error("Invalid face data:", d);
                  return null; // Handle case where data doesn't match expected structure
              }
          }).filter(descriptor => descriptor !== null); // Filter out invalid data

          // Check if any descriptors were successfully loaded
          if (labeledDescriptors.length > 0) {
              console.log("Descriptors successfully loaded.");
              // Set matching threshold to 0.3 (70% similarity)
              faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.3);
              console.log("Face matcher created.");
          } else {
              console.error("No valid descriptors found.");
          }
      } else {
          console.error("Invalid response format: Expected an array.");
      }

  } catch (error) {
      console.error("Error loading descriptors:", error);
  }
}


video.addEventListener('play', async () => {
  await loadDescriptors();

  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector('.video-container').append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (faceMatcher) {
      resizedDetections.forEach(detection => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        
        if (bestMatch.distance < 0.3) { // 70% threshold
          const label = bestMatch.label;

          // Mark attendance if the student is not already marked
          if (!studentAttendance.has(label)) {
            studentAttendance.add(label);
            markAttendance(label);
          }
        }
      });
    }
  }, 100);
});

// Update attendance list in the UI
function markAttendance(label) {
  const attendanceList = document.getElementById('student-attendance');
  const listItem = document.createElement('li');
  listItem.textContent = `${label} Attendance marked`;
  attendanceList.appendChild(listItem);
  console.log(`Marked attendance for ${label}`);
  // setTimeout(() => {
  //   attendanceList.innerHTML = ''
  // }, 3000);
}
