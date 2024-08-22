// import '/Image-editor-with-obj.-detection/style.css'
// import * as tf from '@tensorflow/tfjs';
// import { renderBoxes } from "./utils/renderBox";
// import { non_max_suppression } from "./utils/nonMaxSuppression";
import Konva from '/Image-editor-with-obj.-detection/konva';
import { draw, undo, redo, clearKonva} from '/Image-editor-with-obj.-detection/drawer.js';
// const URL = './TFModel/v8/';

async function init() {
  // const modelURL = URL + 'model_yolov7.json';
  const nextButton = document.getElementById('nextBtn');
  const detectButton = document.getElementById('detectBtn');
  const canvas = document.getElementById('canvas');
  const imageContainer = document.getElementById('image-container');
  const konva = document.getElementById('konva');
  const threshold = 0.1;
  let i = 0;

  // let model = await tf.loadGraphModel(modelURL);
  // console.log('model is loaded');

  let image = document.getElementById('image');
  let newImage = document.createElement('img');

  let konvaContent = document.getElementsByClassName('konvajs-content');

  newImage.onload = function() {
    clearKonva(konvaLayer);
    let height = newImage.height;
    let width = newImage.width;
    if(height / width == 4 / 3){
      canvas.style.width = '33.75vw';
      canvas.style.height = '45vw';
      image.style.width = '33.75vw';
      image.style.height = '45vw';
      image.style.left = 0;
      imageContainer.style.width = '33.75vw';
      imageContainer.style.height = '45vw';
    }else if(width / height == 4 / 3){
      canvas.style.width = '60vw';
      canvas.style.height = '45vw';
      image.style.width = '60vw';
      image.style.height = '45vw';
      image.style.left = 0;
      imageContainer.style.width = '60vw';
      imageContainer.style.height = '45vw';
    }

    image.src = newImage.src;
  }

  let konvaLayer = startKonva(imageContainer);

  nextButton.addEventListener('click', () => {
    counter();
    openFile(newImage);
    canvas.getContext('2d').clearRect(0, 0, 640, 640); // clean canvas
  })
  
  // detectButton.addEventListener('click', () => {
  //   console.log('Start:')
  //   console.log(new Date());
  //   canvas.getContext('2d').clearRect(0, 0, 640, 640); // clean canvas
  //   detect(newImage);
  // })


  // async function detect(photo) {
  //   const model_dim = [640, 640];
  //   let allDetections = [];

  //   //test cropping
  //   let imageTensor = tf.browser.fromPixels(photo);
  //   console.log(imageTensor.shape);
  
  //   for(let i = 0; i <= 3; i++){
  //     let cropStartPoint = [0, 0, 0];
  //     let cropSize = [640, 640, 3];

  //     if (i == 1){
  //       cropStartPoint = [0, 116, 0];
  //     }else if (i == 2){
  //       cropStartPoint = [368, 0, 0];
  //     }else if (i == 3){
  //       cropStartPoint = [368, 116, 0];
  //     }

  //     let croppedTensor = tf.slice(imageTensor, cropStartPoint, cropSize);

  //     const input = tf.tidy(() => {
  //       const img = tf.image
  //                   .resizeBilinear(croppedTensor, model_dim, true)
  //                   .div(255.0)
  //                   .transpose([2, 0, 1])
  //                   .expandDims(0);
  //       return img;
  //     });

  //     //constants to compensate for displayed and calculated image resolution difference
  //     const stretchX = 1/(756/640);
  //     const stretchY = 1/(1008/640);
  //     const transferX = cropStartPoint[1];
  //     const transferY = cropStartPoint[0];
  //     //ctx.strokeRect((transferX + x1) * stretchX,(transferY + y1) * stretchY, width * stretchX, height * stretchY);

  //     //prediction with initial filtering + transformation
  //     const result = await model.executeAsync(input).then((res) => {
  //       res = res.arraySync()[0];
  //       console.log('res:')
  //       console.log(res);

  //       //remove items with confidence under the specified treshold vaule
  //       let detections = [];
  //       for(let i = 0; i <= res.length - 1; i++) {
  //         if(res[i][4] >= threshold){
  //           detections.push(res[i]);
  //         }
  //       }

  //       for(let i = 0; i <= detections.length - 1; i++){
  //         detections[i][0] = (transferX + detections[i][0]) * stretchX;
  //         detections[i][1] = (transferY + detections[i][1]) * stretchY;
  //         detections[i][2] = detections[i][2] * stretchX;
  //         detections[i][3] = detections[i][3] * stretchY;
  //       }

  //       // const boxes = shortenedCol(detections, [0,1,2,3]);
  //       // const scores = shortenedCol(detections, [4]);
  //       // const class_detect = shortenedCol(detections, [5]);
  //       console.log(`detections ${i}.`);
  //       console.log(detections);

  //       return detections;
  //     });

  //     allDetections = [...allDetections, ...result];

  //   }

  //   //sort the detections before filtering, to make sure the best results get selected during overlap check
  //   bubbleSort(allDetections);
  //   console.log('allDetections after sorting:');
  //   console.log(allDetections);
  //   //remove overlapping items from the array
  //   let filteredDetections = non_max_suppression(allDetections);
  //   console.log('filteredDetections:');
  //   console.log(filteredDetections);

  //   renderBoxes(canvas, threshold, filteredDetections);

  //   console.log('End:')
  //   console.log(new Date());
  // }

  // function shortenedCol(arrayofarray, indexlist) {
  //   return arrayofarray.map(function (array) {
  //       return indexlist.map(function (idx) {
  //           return array[idx];
  //       });
  //   });
  // }

  function counter() {
    i++;
  }

  // function bubbleSort(array) {
  //   for (var i = 0; i < array.length; i++) {
  //     // Last i elements are already in place
  //     for (var j = 0; j < (array.length - i - 1); j++) {
  //         // Checking if the item at present iteration 
  //         // is greater than the next iteration
  //         if (array[j][4] > array[j + 1][4]) {
  //             // If the condition is true
  //             // then swap them
  //             var temp = array[j];
  //             array[j] = array[j + 1];
  //             array[j + 1] = temp;
  //         }
  //     }
  //   }
  // }
}

const pickerOpts = {
  types: [
    {
      description: "Images",
      accept: {
        "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
};

async function openFile(image) {
  // Open file picker and destructure the result the first handle
  const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  // get file contents
  const fileData = await fileHandle.getFile();

  let urlObject = window.URL;
  image.src = urlObject.createObjectURL(fileData);
}

function startKonva(imageContainer){
  let stage = new Konva.Stage({
    width: imageContainer.clientWidth,
    height: imageContainer.clientHeight,
    container: 'konva',
  });

  let layer = new Konva.Layer();
  stage.add(layer);

  stage.addEventListener("click.event1", () => {
    let checkedShape = document.forms.shapeForm.elements.shape.value;
    let checkedColor = document.forms.shapeForm.elements.color.value;
    let checkedStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;

    if(checkedShape !== 'none'){
      draw(checkedShape, checkedColor, checkedStrokeWidth, stage, layer);
    }
  }, {once: true});

  window.addEventListener('click', ()=>{
    stage.setAttrs({
      width: imageContainer.clientWidth,
      height: imageContainer.clientHeight,
    });
  })

  //Starts drawing when sidebar is clicked
  const sideBar = document.getElementById('sideBar');
  sideBar.addEventListener('click', () =>{
    let checkedShape = document.forms.shapeForm.elements.shape.value;
    let checkedColor = document.forms.shapeForm.elements.color.value;
    let checkedStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;

    stage.off('mousedown.mousedownEvent');
    stage.off('mousemove.mouseMoveEvent');
    stage.off('mouseup.mouseUpEvent');
    stage.off('click.event1');

    stage.addEventListener("click.event1", () => {
      console.log(document.forms.shapeForm.elements.shape.value);
      if(document.forms.shapeForm.elements.shape.value !== 'none'){
        draw(checkedShape, checkedColor, checkedStrokeWidth, stage, layer);
      }
    }, {once: true});
  });

  //Listens to Ctrl+Z and Ctrl + Y
  function KeyPress(e) {
    var evtobj = window.evt? evt : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey){
      undo();
    }

    if (evtobj.keyCode == 89 && evtobj.ctrlKey){
      redo(layer);
    }
  }

  document.onkeydown = KeyPress;

  layer.draw(); 

  return layer;
}

init()
