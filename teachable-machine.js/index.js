// Create blank variable for network
let net;
// Get doc element with id of status
const status = document.getElementById("status");
// Swap string for below
status.innerText = "Loaded TensorFlow.js - version: " + tf.version.tfjs;
// initialize dict for images
// Make a list of class names
const classes = ["A", "B", "C"];
// Create k nearest neighbors classifier
const classifier = knnClassifier.create();
// Get webcam element from html doc
const webcamElement = document.getElementById("webcam");

function updateTable(objD) {
  for (var key in objD) {
    // check if the property/key is defined in the object itself, not in parent
    if (objD.hasOwnProperty(key)) {
      var tr = "<tr>";
      if (
        objD[key]
          .toString()
          .substring(
            objD[key].toString().indexOf("."),
            objD[key].toString().length
          ) < 2
      )
        objD[key] += "0";

      tr +=
        "<td>" + key + "</td>" + "<td>" + objD[key].toString() + "</td></tr>";
      tbody.innerHTML += tr;
      console.log(key, objD[key]);
    }
  }
}
/**/

// Make asyncronous function to get actual Mobilenet Class prediction
//
async function appSimpleRT() {
  // Load the model.
  console.log("Loading mobilenet..");
  net = await mobilenet.load();
  console.log("Successfully loaded model");
  // Create an object from Tensorflow.js data API which could capture image
  // from the web camera as Tensor.
  const webcam = await tf.data.webcam(webcamElement);
  while (true) {
    const img = await webcam.capture();
    const result = await net.classify(img);
    document.getElementById("console").innerText = `
      Prediction: ${result[0].className}\n
      Probability: ${result[0].probability}
    `;
    // Dispose the tensor to release the memory.
    img.dispose();
    // Give some breathing room by waiting for the next animation frame to
    // fire.
    await tf.nextFrame();
  }
}

// Make async function that takes mobilenet layer activations
// on an image and classifies them using KNN
//
async function app() {
  console.log("Loading mobilenet..");

  // Load the model.
  net = await mobilenet.load();
  console.log("Successfully loaded model");

  // Create an object from Tensorflow.js data API which could capture image
  // from the web camera as Tensor.
  const webcam = await tf.data.webcam(webcamElement);

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExampleImage = async (classId) => {
    // Capture an image from the web camera.
    const img = await webcam.capture();

    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(img, true);

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);

    //updateTable(classifier.getClassExampleCount());

    img.dispose();
  };

  const resetModel = (async) => {
    //clear knn classes
    classifier.clearAllClasses();
    //reset doc element displaying predictions
    document.getElementById("console").innerHTML = "";
  };

  // When clicking a button, add an example for that class.
  document
    .getElementById("class-a")
    .addEventListener("click", () => addExampleImage(0));
  document
    .getElementById("class-b")
    .addEventListener("click", () => addExampleImage(1));
  document
    .getElementById("class-c")
    .addEventListener("click", () => addExampleImage(2));
  document
    .getElementById("reset_classes")
    .addEventListener("click", () => resetModel());
  //document.getElementById('check_classes').addEventListener('click', () =>  console.log(classifier.getClassExampleCount()));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      const img = await webcam.capture();

      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(img, "conv_preds");
      // Get the most likely class and confidence from the classifier module.
      const result = await classifier.predictClass(activation);

      const confidence =
        Math.round(result.confidences[result.label] * 100) / 100;

      document.getElementById("console").innerText = `
          prediction: ${classes[result.label]}\n
          probability: ${confidence}
        `;

      // Dispose the tensor to release the memory.
      img.dispose();
    }

    await tf.nextFrame();
  }
}

app();

/*

*/
