import React, { useState, useEffect, useRef, useCallback } from "react";
import { render } from "react-dom";
import Webcam from "react-webcam";

const knnClassifier = require("@tensorflow-models/knn-classifier");
const mobilenet = require("@tensorflow-models/mobilenet");
const tf = require("@tensorflow/tfjs");

const buttonData = [
  { name: "Add A", fn: 0, resetButton: false },
  { name: "Add B", fn: 1, resetButton: false },
  { name: "Add C", fn: 2, resetButton: false },
  { name: "Reset Model", resetButton: true },
];

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

// initialize dict for images
// Make a list of class names
const classes = ["A", "B", "C"];
// Create k nearest neighbors classifier
const classifier = knnClassifier.create();
// Get webcam element from html doc

// function UpdateTable({ objD }) {
//   return (
//     <table>
//       <tbody>
//         {Object.keys(objD).map((key) => {
//           if (objD.hasOwnProperty(key)) {
//             if (
//               objD[key]
//                 .toString()
//                 .substring(
//                   objD[key].toString().indexOf("."),
//                   objD[key].toString().length
//                 ) < 2
//             )
//               objD[key] += "0";
//             console.log(key, objD[key]);
//             return (
//               <tr>
//                 <td>{key}</td>
//                 <td>{objD[key].toString()}</td>
//               </tr>
//             );
//           }
//         })}
//       </tbody>
//     </table>
//   );
// }

export default function App() {
  const [reset, setReset] = useState({});
  const [net, setNet] = useState();

  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  }, [webcamRef]);

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  useEffect(() => {
    if (net) runPred();
  });

  const loadModel = async () => {
    try {
      const model = await mobilenet.load();
      setNet(model);
    } catch (e) {
      console.log(e);
    }
  };

  // Create an object from Tensorflow.js data API which could capture image
  // from the web camera as Tensor.

  const runPred = async () => {
    while (true) {
      if (classifier.getNumClasses() > 0) {
        const imgd = new Image(640, 480);
        imgd.src = capture();
        const img = tf.browser.fromPixels(imgd);

        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(img, "conv_preds");
        // Get the most likely class and confidence from the classifier module.
        await classifier.predictClass(activation).then((res) => {
          const confidence = Math.round(res.confidences[res.label] * 100) / 100;

          setReset({
            prediction: classes[res.label],
            probability: confidence,
          });
          console.log(reset);
          console.log(res.label);
        });

        // Dispose the tensor to release the memory.
        img.dispose();
      }

      await tf.nextFrame();
    }
  };

  return (
    <main>
      <h2>Loaded TensorFlow.js - version: {tf.version.tfjs}</h2>
      <div id="console">
        {Boolean(reset) ? `${reset.prediction} \n ${reset.probability}` : ""}
      </div>

      <Webcam
        ref={webcamRef}
        videoConstraints={videoConstraints}
        screenshotFormat="image/jpeg"
        className="cam"
      />

      {buttonData.map((b) => {
        return (
          <button
            className="big-button"
            style={{ display: "block", margin: "5 auto", left: "-180" }}
            onClick={
              b.resetButton
                ? () => {
                    //clear knn classes
                    classifier.clearAllClasses();
                    setReset({});
                  }
                : () => {
                    const imgd = new Image(640, 480);
                    imgd.src = capture();
                    const img = tf.browser.fromPixels(imgd);
                    const activation = net.infer(img, true);
                    classifier.addExample(activation, b.number);

                    img.dispose();
                  }
            }
          >
            {b.name}
          </button>
        );
      })}

      {/* <UpdateTable objD = {classifier.getClassExampleCount()} /> */}
      <img
        id="frame"
        src="https://mdn.mozillademos.org/files/242/Canvas_picture_frame.png"
        width="132"
        height="150"
        alt="webcam view"
      ></img>
    </main>
  );
}
