function UpdateTable({ objD }) {
  return (
    <table>
      <tbody>
        {Object.keys(objD).map((key) => {
          if (objD.hasOwnProperty(key)) {
            if (
              objD[key]
                .toString()
                .substring(
                  objD[key].toString().indexOf("."),
                  objD[key].toString().length
                ) < 2
            )
              objD[key] += "0";
            console.log(key, objD[key]);
            return (
              <tr>
                <td>{key}</td>
                <td>{objD[key].toString()}</td>
              </tr>
            );
          }
        })}
      </tbody>
    </table>
  );
}

// Make asyncronous function to get actual Mobilenet Class prediction
//
async function appSimpleRT() {
  // Load the model.
  console.log("Loading mobilenet..");
  // net = await mobilenet.load();
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
