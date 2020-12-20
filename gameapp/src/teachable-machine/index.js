import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const knnClassifier = require("@tensorflow-models/knn-classifier");
const mobilenet = require("@tensorflow-models/mobilenet");
const tf = require("@tensorflow/tfjs");

const classifier = knnClassifier.create();

const buttonData = [
  { name: "Add A", cn: 0, resetButton: false },
  { name: "Add B", cn: 1, resetButton: false },
  { name: "Add C", cn: 2, resetButton: false },
  { name: "Reset Model", cn: 3, resetButton: true },
];

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export default function App() {
  const [reset, setReset] = useState();
  const [net, setNet] = useState();

  const webcamRef = useRef(null);

  const classes = ["A", "B", "C"];

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
      // // Create k nearest neighbors classifier
      // setClassifier();
    } catch (e) {
      console.log(e);
    }
  };

  const base64toImg = (baseURL) => {
    const imgD = new Image(640, 480);
    imgD.SRC = baseURL;

    return imgD;
  };

  // Create an object from Tensorflow.js data API which could capture image
  // from the web camera as Tensor.

  const runPred = async () => {
    while (true) {
      if (classifier.getNumClasses() > 0) {
        const img = tf.browser.fromPixels(base64toImg(capture()));

        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(img, "conv_preds");
        // Get the most likely class and confidence from the classifier module.
        await classifier.predictClass(activation).then((res) => {
          const confidence = Math.round(res.confidences[res.label] * 100) / 100;

          setReset({
            prediction: classes[res.label],
            probability: confidence,
          });
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
      <h2 style={{ color: "white" }}>
        {Boolean(reset)
          ? `Prediction: ${reset.prediction} \n Probability: ${reset.probability}`
          : ""}
      </h2>

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
            key={b.cn}
            style={{ display: "block", margin: "5 auto" }}
            onClick={
              b.resetButton
                ? () => {
                    //clear knn classes
                    classifier.clearAllClasses();
                    setReset(null);
                  }
                : () => {
                    const img = tf.browser.fromPixels(base64toImg(capture()));
                    const activation = net.infer(img, true);
                    classifier.addExample(activation, b.cn);

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
