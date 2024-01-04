import Konva from "konva";

const shapeList = [];
const redoList = [];

const colorFieldset = document.getElementById('colorFieldset');
const strokeWidthFieldset = document.getElementById('strokeWidthFieldset');

function draw(shape, color, strokeWidth, stage, layer) {
    switch (shape) {
        case 'rect':
            drawRect(color, strokeWidth, stage, layer);
            break;
        case 'circle':
            drawCircle(color, strokeWidth, stage, layer);
            break;
        case 'line':
            drawLine(color, strokeWidth, stage, layer);
            break;
        case 'arrow':
            drawArrow(color, strokeWidth, stage, layer);
            break;
        case 'doubleArrow':
            drawDoubleArrow(color, strokeWidth, stage, layer);
            break;
        case 'freehand':
            drawFreehand(color, strokeWidth, stage, layer);
            break;
        case 'text':
            addSimpleText(stage, layer);
            break;
        case 'dimension':
            addDimension(color, strokeWidth, stage, layer);
            break;
    }
    console.log('shapeList:');
    console.log(shapeList);
}

function drawRect(color, strokeWidth, stage, layer) {
    let contour = new Konva.Rect({
      fill: 'rgba(0,0,0,0.1)',
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });
    layer.add(contour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // console.log('Clicked button:');
      // console.log(e.evt.button);

      // do nothing if we mousedown on any shape
      if (e.target !== stage || e.evt.button !== 0) {
        return;
      }

      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      contour.visible(true);
      contour.width(0);
      contour.height(0);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!contour.visible()) {
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      contour.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
      if (x1 == x2 && y1 == y2) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        drawRect(color, strokeWidth, stage, layer);
        return;
      }

      e.evt.preventDefault();

      let newRect = new Konva.Rect({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        fill: 'rgba(0,0,0,0)',
        stroke: `${color}`,
        strokeWidth: `${strokeWidth}`,
        draggable: false,
        hitStrokeWidth: 5,
        strokeScaleEnabled: false,
        visible: true,
        name: 'rect',
      });

      shapeList.push(newRect);
      eraseRedolist();
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        contour.visible(false);
        layer.add(newRect);
        rectTransformer(newRect, layer);
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      });
    });
}

function drawCircle(color, strokeWidth, stage, layer) {
    let circleContour = new Konva.Circle({
      fill: 'rgba(0,0,0,0.1)',
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });
    layer.add(circleContour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // do nothing if we mousedown on any shape
      if (e.target !== stage || e.evt.button !== 0) {
        return;
      }
      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      circleContour.visible(true);
      circleContour.radius(0);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!circleContour.visible()) {
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      circleContour.setAttrs({
        x: x1,
        y: y1,
        radius: Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)),
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
        if (x1 == x2 && y1 == y2) {
            stage.off('mousedown.mousedownEvent');
            stage.off('mousemove.mouseMoveEvent');
            stage.off('mouseup.mouseUpEvent');
            drawCircle(color, strokeWidth, stage, layer);
            return;
        }

      e.evt.preventDefault();
      let newCircle = new Konva.Circle({
          x: x1,
          y: y1,
          radius: Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)),
          fill: 'rgba(0,0,0,0)',
          stroke: `${color}`,
          strokeWidth: `${strokeWidth}`,
          draggable: false,
          hitStrokeWidth: 5,
          strokeScaleEnabled: false,
          visible: true,
          name: 'circle'
      });

      shapeList.push(newCircle);
      eraseRedolist();
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        circleContour.visible(false);
        layer.add(newCircle);
        circleTransformer(newCircle, layer);
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      });
      
    });
}

function drawLine(color, strokeWidth, stage, layer) {
    let lineContour = new Konva.Line({
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });
    layer.add(lineContour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // do nothing if we mousedown on any shape
      if ((e.target !== stage && (e.target.attrs.name !== 'rect' && e.target.attrs.name !== 'circle')) || e.evt.button !== 0) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawLine(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.visible(true);
      lineContour.points([x1, y1]);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!lineContour.visible()) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawLine(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.setAttrs({
        points: [x1, y1, x2, y2],
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
        if (x1 == x2 && y1 == y2 || (Math.abs(x1-x2) <= 30 && Math.abs(y1-y2) <= 30)) {
            stage.off('mousedown.mousedownEvent');
            stage.off('mousemove.mouseMoveEvent');
            stage.off('mouseup.mouseUpEvent');
            lineContour.visible(false);
            lineContour.destroy();
            x1 = 0;
            x2 = 0;
            y1 = 0;
            y2 = 0;
            drawLine(color, strokeWidth, stage, layer);
            return;
        }

      e.evt.preventDefault();

      let newLine = new Konva.Line({
          points: [x1, y1, x2, y2],
          stroke: `${color}`,
          strokeWidth: `${strokeWidth}`,
          draggable: false,
          strokeScaleEnabled: false,
          hitStrokeWidth: 5,
          visible: true,
          name: 'line',
      });

      let addToShapelist = checkDuplicates(newLine);
      console.log('addToShapelist');
      console.log(addToShapelist);

      if(addToShapelist){
        shapeList.push(newLine);
        eraseRedolist()
        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
          lineContour.visible(false);
          layer.add(newLine);
          lineTransformer(newLine, layer);
          x1 = 0;
          x2 = 0;
          y1 = 0;
          y2 = 0;
        });
      }else{
        lineContour.visible(false);
        layer.remove(lineContour);
        lineContour.destroy();
        newLine.visible(false);
        newLine.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      }
    });
}

function drawArrow(color, strokeWidth, stage, layer) {
    let lineContour = new Konva.Arrow({
      fill: `${color}`,
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });
    layer.add(lineContour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // do nothing if we mousedown on any shape
      if ((e.target !== stage && (e.target.attrs.name !== 'rect' && e.target.attrs.name !== 'circle')) || e.evt.button !== 0) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawArrow(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.visible(true);
      lineContour.points([x1, y1]);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!lineContour.visible()) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawArrow(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.setAttrs({
        points: [x1, y1, x2, y2],
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
        if (x1 == x2 && y1 == y2 || (Math.abs(x1-x2) <= 25 && Math.abs(y1-y2) <= 25)) {
            stage.off('mousedown.mousedownEvent');
            stage.off('mousemove.mouseMoveEvent');
            stage.off('mouseup.mouseUpEvent');
            drawArrow(color, strokeWidth, stage, layer);
            lineContour.visible(false);
            // layer.remove(lineContour);
            x1 = 0;
            x2 = 0;
            y1 = 0;
            y2 = 0;
            return;
        }
      e.evt.preventDefault();

      let newArrow = new Konva.Arrow({
          points: [x1, y1, x2, y2],
          fill: `${color}`,
          stroke: `${color}`,
          strokeWidth: `${strokeWidth}`,
          draggable: false,
          hitStrokeWidth: 5,
          strokeScaleEnabled: false,
          visible: true,
      });
      let addToShapelist = checkDuplicates(newArrow);

      if(addToShapelist){
        shapeList.push(newArrow);
        eraseRedolist()

        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
          lineContour.visible(false);
          layer.add(newArrow);
          lineTransformer(newArrow, layer)
          x1 = 0;
          x2 = 0;
          y1 = 0;
          y2 = 0;
        });
      }else{
        lineContour.visible(false);
        layer.remove(lineContour);
        lineContour.destroy();
        newArrow.visible(false);
        newArrow.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      }
    });
}

function drawDoubleArrow(color, strokeWidth, stage, layer) {
    let lineContour = new Konva.Arrow({
      fill: `${color}`,
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });
    layer.add(lineContour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // do nothing if we mousedown on any shape
      if ((e.target !== stage && (e.target.attrs.name !== 'rect' && e.target.attrs.name !== 'circle')) || e.evt.button !== 0) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawDoubleArrow(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.visible(true);
      lineContour.points([x1, y1]);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!lineContour.visible()) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
        drawDoubleArrow(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      lineContour.setAttrs({
        points: [x1, y1, x2, y2],
        pointerAtBeginning: true
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
        if (x1 == x2 && y1 == y2 || (Math.abs(x1-x2) <= 20 && Math.abs(y1-y2) <= 20)) {
          stage.off('mousedown.mousedownEvent');
          stage.off('mousemove.mouseMoveEvent');
          stage.off('mouseup.mouseUpEvent');
          drawDoubleArrow(color, strokeWidth, stage, layer);
          lineContour.visible(false);
          // layer.remove(lineContour);
          x1 = 0;
          x2 = 0;
          y1 = 0;
          y2 = 0;
          return;
        }
      e.evt.preventDefault();

      let newDoubleArrow = new Konva.Arrow({
          points: [x1, y1, x2, y2],
          pointerAtBeginning: true,
          fill: `${color}`,
          stroke: `${color}`,
          strokeWidth: `${strokeWidth}`,
          draggable: false,
          hitStrokeWidth: 5,
          strokeScaleEnabled: false,
          visible: true,
      })

      let addToShapelist = checkDuplicates(newDoubleArrow);

      if(addToShapelist){
        shapeList.push(newDoubleArrow);
        eraseRedolist();

        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
          lineContour.visible(false);
          layer.add(newDoubleArrow);
          lineTransformer(newDoubleArrow, layer)
          x1 = 0;
          x2 = 0;
          y1 = 0;
          y2 = 0;
        });
      }else{
        lineContour.visible(false);
        layer.remove(lineContour);
        lineContour.destroy();
        newDoubleArrow.visible(false);
        newDoubleArrow.destroy();
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      }
    });
}

function drawFreehand(color, strokeWidth, stage, layer) {
    let lineContour = new Konva.Line({
      stroke: `${color}`,
      strokeWidth: `${strokeWidth}`,
      visible: false,
    });

    let linePoints = [];
    layer.add(lineContour);

    let x1, y1, x2, y2;
    stage.on('mousedown.mousedownEvent', (e) => {
      // do nothing if we mousedown on any shape
      if ((e.target !== stage && (e.target.attrs.name !== 'rect' && e.target.attrs.name !== 'circle')) || e.evt.button !== 0) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        drawFreehand(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x1 = stage.getPointerPosition().x;
      y1 = stage.getPointerPosition().y;
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      linePoints.push(x1, y1);
      lineContour.visible(true);
      lineContour.points(linePoints);
    });

    stage.on('mousemove.mouseMoveEvent', (e) => {
      // do nothing if we didn't start selection
      if (!lineContour.visible()) {
        stage.off('mousedown.mousedownEvent');
        stage.off('mousemove.mouseMoveEvent');
        stage.off('mouseup.mouseUpEvent');
        lineContour.visible(false);
        lineContour.destroy();
        drawFreehand(color, strokeWidth, stage, layer);
        return;
      }
      e.evt.preventDefault();
      x2 = stage.getPointerPosition().x;
      y2 = stage.getPointerPosition().y;

      linePoints.push(x2, y2);
      lineContour.setAttrs({
        points: linePoints,
      });
    });

    stage.on('mouseup.mouseUpEvent', (e) => {
        if (x1 == x2 && y1 == y2) {
            stage.off('mousedown.mousedownEvent');
            stage.off('mousemove.mouseMoveEvent');
            stage.off('mouseup.mouseUpEvent');
            lineContour.visible(false);
            lineContour.destroy();
            drawFreehand(color, strokeWidth, stage, layer);
            return;
        }
      e.evt.preventDefault();

      let newFreehand = new Konva.Line({
          points: linePoints,
          stroke: `${color}`,
          strokeWidth: `${strokeWidth}`,
          draggable: false,
          hitStrokeWidth: 5,
          strokeScaleEnabled: false,
          visible: true,
      });

      shapeList.push(newFreehand);
      eraseRedolist();
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        lineContour.visible(false);
        layer.add(newFreehand);
        linePoints = [];
      });
    });
}

function addSimpleText(stage, layer) {
  let contour = new Konva.Text({
    text: '??',
    fontSize: 20,
    visible: false,
  });

  layer.add(contour);

  let x, y;
  stage.on('mouseup.mouseUpEvent', (e) => {
    // do nothing if we mousedown on any shape (or not left-click)
    if (e.target !== stage || e.evt.button !== 0) {
      return;
    }
    e.evt.preventDefault();
    x = stage.getPointerPosition().x;
    y = stage.getPointerPosition().y;

    let newText = new Konva.Text({
      text: '??',
      fontSize: 20,
      x: x,
      y: y,
      draggable: true,
      strokeScaleEnabled: false,
      visible: true,
    });

    newText.setAttrs({
      x: newText.x() - newText.width() / 2,
      y: newText.y() - newText.width() / 2,
    });

    let addToShapelist = checkDuplicates(newText);

    let textGroup = new Konva.Group();
    textGroup.setAttrs({
      name: 'textGroup'
    });
    
    if(addToShapelist){
      shapeList.push(newText);
      eraseRedolist();
      let backgroundRect = textBackground(newText);

      textGroup.add(backgroundRect);
      textGroup.add(newText);
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        layer.add(textGroup);
        textEditor(newText, backgroundRect, stage, layer);
        x = 0;
        y = 0;
        contour.visible(false);
        contour.destroy();
      });
    }else{
      contour.visible(false);
      contour.destroy();
      x = 0;
      y = 0;
    }
  });
}

function addDimension(color, strokeWidth, stage, layer) {
  let dimLine = new Konva.Arrow({
    fill: `${color}`,
    stroke: `${color}`,
    strokeWidth: `${strokeWidth}`,
    visible: false,
  });
  layer.add(dimLine);

  let x1, y1, x2, y2;
  stage.on('mousedown.mousedownEvent', (e) => {
    // do nothing if we mousedown on any shape
    if ((e.target !== stage && (e.target.attrs.name !== 'rect' && e.target.attrs.name !== 'circle')) || e.evt.button !== 0) {
      stage.off('mousedown.mousedownEvent');
      stage.off('mousemove.mouseMoveEvent');
      stage.off('mouseup.mouseUpEvent');
      dimLine.visible(false);
      dimLine.destroy();
      x1 = 0;
      x2 = 0;
      y1 = 0;
      y2 = 0;
      addDimension(color, strokeWidth, stage, layer);
      return;
    }
    e.evt.preventDefault();
    x1 = stage.getPointerPosition().x;
    y1 = stage.getPointerPosition().y;
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;

    dimLine.visible(true);
    dimLine.points([x1, y1]);
  });

  stage.on('mousemove.mouseMoveEvent', (e) => {
    // do nothing if we didn't start selection
    if (!dimLine.visible()) {
      stage.off('mousedown.mousedownEvent');
      stage.off('mousemove.mouseMoveEvent');
      stage.off('mouseup.mouseUpEvent');
      dimLine.visible(false);
      dimLine.destroy();
      x1 = 0;
      x2 = 0;
      y1 = 0;
      y2 = 0;
      addDimension(color, strokeWidth, stage, layer);
      return;
    }
    e.evt.preventDefault();
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;

    dimLine.setAttrs({
      points: [x1, y1, x2, y2],
      pointerAtBeginning: true
    });
  });

  stage.on('mouseup.mouseUpEvent', (e) => {
      if (x1 == x2 && y1 == y2 || (Math.abs(x1-x2) <= 20 && Math.abs(y1-y2) <= 20)) {
          stage.off('mousedown.mousedownEvent');
          stage.off('mousemove.mouseMoveEvent');
          stage.off('mouseup.mouseUpEvent');
          addDimension(color, strokeWidth, stage, layer);
          dimLine.visible(false);
          x1 = 0;
          x2 = 0;
          y1 = 0;
          y2 = 0;
          return;
      }
    e.evt.preventDefault();

    let newDoubleArrow = new Konva.Arrow({
        points: [x1, y1, x2, y2],
        pointerAtBeginning: true,
        fill: `${color}`,
        stroke: `${color}`,
        strokeWidth: `${strokeWidth}`,
        draggable: false,
        hitStrokeWidth: 5,
        strokeScaleEnabled: false,
        visible: true,
    })

    let addToShapelist = checkDuplicates(newDoubleArrow);

    if(addToShapelist){
      shapeList.push(newDoubleArrow);
      eraseRedolist();

      let newText = new Konva.Text({
        text: '??',
        fontSize: 20,
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        draggable: false,
        strokeScaleEnabled: false,
        visible: true,
      });

      let connectorLine = new Konva.Line({
        stroke: `${color}`,
        strokeWidth: `${strokeWidth}` - 2 || 2,
        draggable: false,
        strokeScaleEnabled: false,
        visible: false,
        name: 'line',
      });

      let dimLeg1 = new Konva.Line({
        stroke: `${color}`,
        strokeWidth: `${strokeWidth}` - 2 || 2,
        draggable: false,
        strokeScaleEnabled: false,
        visible: false,
        name: 'line',
      });

      let dimLeg2 = new Konva.Line({
        stroke: `${color}`,
        strokeWidth: `${strokeWidth}` - 2 || 2,
        draggable: false,
        strokeScaleEnabled: false,
        visible: false,
        name: 'line',
      });

      newText.setAttrs({
        x: newText.x() - newText.width() / 2,
        y: newText.y() - newText.width() / 2,
      });

      let group = new Konva.Group();
      group.setAttrs({
        name: 'dimGroup'
      });
      group.add(connectorLine);
      group.add(dimLeg1);
      group.add(dimLeg2);
      group.add(newDoubleArrow);
      
      let backgroundRect = textBackground(newText);
      group.add(backgroundRect);
      group.add(newText);
      dimTextEditor(newText, backgroundRect, newDoubleArrow, stage, layer, connectorLine);

      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        dimLine.visible(false);
        // layer.add(newDoubleArrow);
        // layer.add(connectorLine);
        // layer.add(backgroundRect);
        // layer.add(newText);
        layer.add(group);
        dimTransformer(newDoubleArrow, layer, newText, backgroundRect, connectorLine, dimLeg1, dimLeg2);
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
      });
    }else{
      dimLine.visible(false);
      layer.remove(dimLine);
      dimLine.destroy();
      newDoubleArrow.visible(false);
      newDoubleArrow.destroy();
    }
  });
}

function checkDuplicates(shape) {
  if(shapeList.length != 0) {
    if(shapeList[shapeList.length - 1].className != shape.className) {
      return true;
    }
    if(shapeList[shapeList.length - 1].className != 'Text' &&
    shapeList[shapeList.length - 1].attrs.points[0] == shape.attrs.points[0]){
      return false;
    }
    if(shapeList[shapeList.length - 1].className == 'Text' &&
    (shapeList[shapeList.length - 1].attrs.x == shape.attrs.x &&
      shapeList[shapeList.length - 1].attrs.y == shape.attrs.y)){
        return false;
    }
  }

  eraseRedolist();

  return true;
}

function undo() {
  if(shapeList.length != 0) {
    let poppedShape = shapeList.pop();
    if(poppedShape.parent.attrs.name == 'dimGroup' || poppedShape.parent.attrs.name == 'textGroup'){
      redoList.push(poppedShape.parent);
      poppedShape.parent.remove();
    }else{
      redoList.push(poppedShape);
      poppedShape.remove();
    }

  } else {
    alert('nothing to delete');
  }

  console.log(shapeList);
  return;
    // alert('Ctrl + Z');
}

function redo(layer) {
  if(redoList.length != 0) {
    let shapeToRestore = redoList.pop()
    shapeList.forEach(element => {
      if(element._id == shapeToRestore._id){
        let index = shapeList.indexOf(shapeToRestore);
        shapeList.splice(index, 1);
      }
    });
    shapeList.push(shapeToRestore);
    layer.add(shapeToRestore);
  }

  console.log('shapeList');
  console.log(shapeList);
  return;
  // alert('Ctrl + Y');
}

function eraseRedolist() {
  redoList.length = 0;
}

function textEditor(textNode, backgroundRect, stage, layer) {
  textNode.on('dblclick.doubleClick1', () => {
    // create textarea over canvas with absolute position

    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    let textPosition = textNode.getAbsolutePosition();

    // then lets find position of stage container on the page:
    let stageBox = stage.container().getBoundingClientRect();

    // so position of textarea will be the sum of positions above:
    let areaPosition = {
      x: stageBox.left + textPosition.x - textNode.width() / 2,
      y: stageBox.top + textPosition.y  - textNode.height() / 2,
    };

    // create textarea and style it
    let textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    if(textNode.text() == '??' || textNode.text() == ''){
      textarea.value = '';
    }else {
      textarea.value = textNode.text();
    }
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width();
    textarea.style.width = textNode.width();

    textarea.focus();

    //Rect to block new shapes during editing the textarea
    let coverRect = new Konva.Rect({
      fill: 'rgba(0,0,0,0.1)',
      stroke: `lime`,
      strokeWidth: 2,
      x: 0,
      y: 0,
      width: 756,
      height: 1008,
      visible: true,
    });

    layer.add(coverRect);


    window.addEventListener('keydown', function (e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13){
        if(textarea.value == ''){
          document.body.removeChild(textarea);
          coverRect.destroy();
          return;
        }
        textNode.text(textarea.value);
        backgroundRect.setAttrs({
          width: textNode.width(),
          height: textNode.height(),
        });
        document.body.removeChild(textarea);
        coverRect.destroy();
      }else if(evtobj.keyCode == 27){
        document.body.removeChild(textarea);
        coverRect.destroy();
      }
    });
  });

  textNode.on('click.ctrlClick', (e) => {
    if (e.evt.ctrlKey) {
      unlockText(textNode, backgroundRect);

      textNode.on('click.ctrlClick', (e) => {
        if (e.evt.ctrlKey) {
          lockText(textNode, backgroundRect);
        }
      })
    }
  })

}

function textBackground(newText) {
  let backgroundRect = new Konva.Rect({
    fill: 'rgb(255,255,255)',
    stroke: 'black',
    strokeWidth: 1,
    visible: true,
    draggable: true,
    x: newText.x(),
    y: newText.y(),
    width: newText.width(),
    height: newText.height(),
  });

  newText.on('dragmove', function () {
    backgroundRect.setAttrs({
      x: newText.x(),
      y: newText.y(),
    })
  });

  newText.on('dragend', function () {
    backgroundRect.setAttrs({
      x: newText.x(),
      y: newText.y(),
    })
  });

  return backgroundRect;
}

function dimTextEditor(textNode, backgroundRect, dimArrow, stage, layer, connectorLine) {

  textNode.on('dblclick.doubleClick1', () => {
    // create textarea over canvas with absolute position

    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    let textPosition = textNode.getAbsolutePosition();

    // then lets find position of stage container on the page:
    let stageBox = stage.container().getBoundingClientRect();

    // so position of textarea will be the sum of positions above:
    let areaPosition = {
      x: stageBox.left + textPosition.x - textNode.width() / 2,
      y: stageBox.top + textPosition.y  - textNode.height() / 2,
    };

    // create textarea and style it
    let textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    if(textNode.text() == '??' || textNode.text() == ''){
      textarea.value = '';
    }else {
      textarea.value = textNode.text();
    }
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width();
    textarea.style.width = textNode.width();

    textarea.focus();

    //Rect to block new shapes during editing the textarea
    let coverRect = new Konva.Rect({
      fill: 'rgba(0,0,0,0.1)',
      stroke: `lime`,
      strokeWidth: 2,
      x: 0,
      y: 0,
      width: 756,
      height: 1008,
      visible: true,
    });

    layer.add(coverRect);

    const previousX = connectorLine.points()[2];
    const previousY = connectorLine.points()[3];

    function eventCloser(e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13){
        if(textarea.value == ''){
          document.body.removeChild(textarea);
          coverRect.destroy();
          return;
        }
        textNode.text(textarea.value);
        if(textNode.name() == 'stopHinge'){
          textNode.setAttrs({
            x: previousX - textNode.width() / 2,
            y: previousY - textNode.height() / 2,
            // offsetX: 0,
            // offsetY: 0,
          });
        }else{
          textNode.setAttrs({
            x: (dimArrow.points()[0] + dimArrow.points()[2]) / 2  - textNode.width() / 2,
            y: (dimArrow.points()[1] + dimArrow.points()[3]) / 2  - textNode.height() / 2,
            // offsetX: 0,
            // offsetY: 0,
          });
        }

        backgroundRect.setAttrs({
          width: textNode.width(),
          height: textNode.height(),
          x: textNode.x(),
          y: textNode.y(),
          // offsetX: 0,
          // offsetY: 0
        });
    
        document.body.removeChild(textarea);
        coverRect.destroy();
    
        window.removeEventListener('keydown', eventCloser);
      }else if(evtobj.keyCode == 27){
        document.body.removeChild(textarea);
        coverRect.destroy();
    
        window.removeEventListener('keydown', eventCloser);
      }
    };

    window.addEventListener('keydown', eventCloser);
  });

  textNode.on('click.ctrlClick1', (e) => {
    if (e.evt.ctrlKey) {
      unlockText(textNode, backgroundRect, dimArrow, layer, connectorLine);
      textNode.off('click.ctrlClick1');
      dimArrow.off('dragmove.dimDrag1');
      
      textNode.on('click.ctrlClick2', (e) => {
        if (e.evt.ctrlKey) {
          lockText(textNode, backgroundRect, dimArrow, connectorLine);
          textNode.off('click.ctrlClick2');
          textNode.off('dblclick.doubleClick1');
          dimArrow.off('dragmove.drag2');
          textNode.off('dragmove.drag3');
          dimTextEditor(textNode, backgroundRect, dimArrow, stage, layer, connectorLine);
        }
      })
    }
  });
}

function unlockText(textNode, backgroundRect, dimArrow, layer, connectorLine) {
  textNode.setAttrs({
    draggable: true,
    x: (dimArrow.points()[0] + dimArrow.points()[2]) / 2  - textNode.width() / 2 + 50,
    y: (dimArrow.points()[1] + dimArrow.points()[3]) / 2  - textNode.height() / 2,
    name: 'stopHinge',
  });
  
  backgroundRect.setAttrs({
    x: textNode.x(),
    y: textNode.y(),
  });

  connectorLine.setAttrs({
    points: [(dimArrow.points()[0] + dimArrow.points()[2]) / 2,
            (dimArrow.points()[1] + dimArrow.points()[3]) / 2,
            textNode.x() + textNode.width() / 2,
            textNode.y() + textNode.height() / 2],
    visible: true,
  });

  dimArrow.on('dragmove.drag2', () => {
    connectorLine.setAttrs({
      points: [(dimArrow.points()[0] + dimArrow.points()[2]) / 2 + dimArrow.x(),
      (dimArrow.points()[1] + dimArrow.points()[3]) / 2 + dimArrow.y(),
      textNode.x() + textNode.width() / 2,
      textNode.y() + textNode.height() / 2],
    });
  });

  textNode.on('dragmove.drag3', () => {
    connectorLine.setAttrs({
      points: [(dimArrow.points()[0] + dimArrow.points()[2]) / 2,
      (dimArrow.points()[1] + dimArrow.points()[3]) / 2,
      textNode.x() + textNode.width() / 2,
      textNode.y() + textNode.height() / 2],
    });
  });
}

function lockText(textNode, backgroundRect, dimArrow, connectorLine){
  textNode.setAttrs({
    draggable: false,
    name: '',
    x: (dimArrow.points()[0] + dimArrow.points()[2]) / 2  - textNode.width() / 2,
    y: (dimArrow.points()[1] + dimArrow.points()[3]) / 2  - textNode.height() / 2,
  });
  
  backgroundRect.setAttrs({
    x: textNode.x(),
    y: textNode.y(),
  });

  connectorLine.setAttrs({
    visible: false,
  }); 
}

//Transformer for lines and arrows
//Enables dragging by the ends
function lineTransformer(line, layer) {
  line.on('dragend', () => {
    line.setAttrs({
      points: [line.points()[0] + line.x(),
              line.points()[1] + line.y(),
              line.points()[2] + line.x(),
              line.points()[3] + line.y()],
      x: 0,
      y: 0,
    });
  });

  function onDoubleClick(){
    line.off('dblclick.doubleClick1');
    const anchor1 = new Konva.Circle({
      x: line.points()[0] + line.x(),
      y: line.points()[1] + line.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });
  
    const anchor2 = new Konva.Circle({
      x: line.points()[2] + line.x(),
      y: line.points()[3] + line.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });

    line.setAttrs({
      draggable: true,
    });

    layer.add(anchor1);
    layer.add(anchor2);

    anchor1.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor2.setAttrs({
      visible: true,
      draggable: true,
    });
    

    anchor1.on('dragmove.drag1', () => {
      line.setAttrs({
        points: [
          anchor1.x(),
          anchor1.y(),
          anchor2.x(),
          anchor2.y()]
      });
    });

    anchor2.on('dragmove.drag2', () => {
      line.setAttrs({
        points: [
          anchor1.x(),
          anchor1.y(),
          anchor2.x(),
          anchor2.y()]
      });
    });

    line.on('dragmove.drag3', () => {
      anchor1.setAttrs({
        x: line.points()[0] + line.x(),
        y: line.points()[1] + line.y(),
      });

      anchor2.setAttrs({
        x: line.points()[2] + line.x(),
        y: line.points()[3] + line.y(),
      });
    });

    colorFieldset.addEventListener('click', changeShapeColor);
    strokeWidthFieldset.addEventListener('click', changeShapeStrokeWidth);

    function changeShapeColor(){
      let newColor = document.forms.shapeForm.elements.color.value;
      line.setAttrs({
        stroke: `${newColor}`,
        fill: `${newColor}`,
      });
    };

    function changeShapeStrokeWidth(){
      let newStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;
      line.setAttrs({
        strokeWidth: `${newStrokeWidth}`,
      });
    };

    function eventCloser(e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13 || evtobj.keyCode == 27){
        line.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        line.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 46 || evtobj.keyCode == 8){
        line.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        redoList.push(line);
        line.remove();
        line.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 90 && evtobj.ctrlKey){
        line.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        line.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      };
    };

    window.addEventListener('keydown', eventCloser);
  }

  line.on('dblclick.doubleClick1', onDoubleClick);
}

function dimTransformer(line, layer, text, textBackground, connectorLine, dimLeg1, dimLeg2) {
  line.on('dragend', () => {
    line.setAttrs({
      points: [line.points()[0] + line.x(),
              line.points()[1] + line.y(),
              line.points()[2] + line.x(),
              line.points()[3] + line.y()],
      x: 0,
      y: 0,
    });

    if(text.name() == ''){
      text.setAttrs({
        draggable: false,
      });
    }
    // textBackground.setAttrs({
    //   x: (line.points()[0] + line.points()[2]) / 2 - text.width() / 2,
    //   y: (line.points()[1] + line.points()[3]) / 2 - text.height() / 2,
    // });
  });

  line.on('dragmove', () => {
    if(text.name() != 'stopHinge'){
      text.setAttrs({
        draggable: true,
        x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
        y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
        // offsetX: 0,
        // offsetY: 0,
      });

      textBackground.setAttrs({
        x: text.x(),
        y: text.y(),
      });
    }
  });

  function onDoubleClick(){
    line.off('dblclick.doubleClick1');

    line.setAttrs({
      draggable: true,
    });

    const anchor1 = new Konva.Circle({
      x: line.points()[0] + line.x(),
      y: line.points()[1] + line.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });
  
    const anchor2 = new Konva.Circle({
      x: line.points()[2] + line.x(),
      y: line.points()[3] + line.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });

    layer.add(anchor1);
    layer.add(anchor2);

    anchor1.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor2.setAttrs({
      visible: true,
      draggable: true,
    });
    
    anchor1.on('dragmove.drag1', () => {
      line.setAttrs({
        points: [
          anchor1.x(),
          anchor1.y(),
          anchor2.x(),
          anchor2.y()]
      });

      if(text.name() != 'stopHinge') {
        text.setAttrs({
          draggable: true,
          x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
          y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
          offsetX: 0,
          offsetY: 0,
        });

        textBackground.setAttrs({
          x: text.x(),
          y: text.y(),
        });

        if(text.name() == ''){
          text.setAttrs({
            draggable: false,
          });
        };
      };

      connectorLine.setAttrs({
        points: [(line.points()[0] + line.points()[2]) / 2,
        (line.points()[1] + line.points()[3]) / 2,
        text.x() + text.width() / 2,
        text.y() + text.height() / 2],
      });

      dimLeg1.points()[0] = line.points()[0];
      dimLeg1.points()[1] = line.points()[1];
      dimLeg2.points()[0] = line.points()[2];
      dimLeg2.points()[1] = line.points()[3];
    });

    anchor2.on('dragmove.drag2', () => {
      line.setAttrs({
        points: [
          anchor1.x(),
          anchor1.y(),
          anchor2.x(),
          anchor2.y()]
      });

      if(text.name() != 'stopHinge') {
        text.setAttrs({
          draggable: true,
          x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
          y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
          offsetX: 0,
          offsetY: 0,
        });

        textBackground.setAttrs({
          x: text.x(),
          y: text.y(),
        });

        if(text.name() == ''){
          text.setAttrs({
            draggable: false,
          });
        }
      };

      connectorLine.setAttrs({
        points: [(line.points()[0] + line.points()[2]) / 2,
        (line.points()[1] + line.points()[3]) / 2,
        text.x() + text.width() / 2,
        text.y() + text.height() / 2],
      });

      dimLeg1.points()[0] = line.points()[0];
      dimLeg1.points()[1] = line.points()[1];
      dimLeg2.points()[0] = line.points()[2];
      dimLeg2.points()[1] = line.points()[3];
    });

    line.on('dragmove.drag3', () => {
      anchor1.setAttrs({
        x: line.points()[0] + line.x(),
        y: line.points()[1] + line.y(),
      });

      anchor2.setAttrs({
        x: line.points()[2] + line.x(),
        y: line.points()[3] + line.y(),
      });

      if(text.name() != 'stopHinge'){
        text.setAttrs({
          draggable: true,
          x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
          y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
          // offsetX: 0,
          // offsetY: 0,
        });
    
        textBackground.setAttrs({
          x: text.x(),
          y: text.y(),
        });
      }

      dimLeg1.points()[0] = line.points()[0] + line.x();
      dimLeg1.points()[1] = line.points()[1] + line.y();
      dimLeg2.points()[0] = line.points()[2] + line.x();
      dimLeg2.points()[1] = line.points()[3] + line.y();
    });

    colorFieldset.addEventListener('click', changeShapeColor);
    strokeWidthFieldset.addEventListener('click', changeShapeStrokeWidth);

    function changeShapeColor(){
      let newColor = document.forms.shapeForm.elements.color.value;
      line.setAttrs({
        stroke: `${newColor}`,
        fill: `${newColor}`,
      });
      connectorLine.setAttrs({
        stroke: `${newColor}`,
        fill: `${newColor}`,
      });
      dimLeg1.setAttrs({
        stroke: `${newColor}`,
        fill: `${newColor}`,
      });
      dimLeg2.setAttrs({
        stroke: `${newColor}`,
        fill: `${newColor}`,
      });
    };

    function changeShapeStrokeWidth(){
      let newStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;
      line.setAttrs({
        strokeWidth: `${newStrokeWidth}`,
      });
      connectorLine.setAttrs({
        strokeWidth: `${newStrokeWidth}` - 2 || 2,
      });
      dimLeg1.setAttrs({
        strokeWidth: `${newStrokeWidth}` - 2 || 2,
      });
      dimLeg2.setAttrs({
        strokeWidth: `${newStrokeWidth}` - 2 || 2,
      });
    };

    function eventCloser(e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13 || evtobj.keyCode == 27){
        line.setAttrs({
          draggable: false,
        });
        anchor1.off('dragmove.drag1');
        anchor1.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        line.on('dblclick.doubleClick1', onDoubleClick);
        line.on('click.ctrlClick2', onCtrlClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 46 || evtobj.keyCode == 8){
        line.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        redoList.push(line.parent);
        line.parent.remove();
        line.on('dblclick.doubleClick1', onDoubleClick);
        line.on('click.ctrlClick2', onCtrlClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 90 && evtobj.ctrlKey){
        line.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        line.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        line.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      };
    };

    window.addEventListener('keydown', eventCloser);
  }

  function onCtrlClick(e) {
    line.off('click.ctrlClick2', onCtrlClick);
    if (e.evt.ctrlKey) {
      if(line.name() != 'offsetIsOn'){
        const dimAnchor1 = new Konva.Circle({
          x: line.points()[0] + line.x(),
          y: line.points()[1] + line.y(),
          radius: 5,
          fill: 'white',
          stroke: 'blue',
          strokeWidth: 1,
          draggable: true,
          visible: true,
        });
      
        const dimAnchor2 = new Konva.Circle({
          x: line.points()[2] + line.x(),
          y: line.points()[3] + line.y(),
          radius: 5,
          fill: 'white',
          stroke: 'blue',
          strokeWidth: 1,
          draggable: true,
          visible: true,
        });

        const legAnchor1 = new Konva.Circle({
          x: line.points()[0] + line.x(),
          y: line.points()[1] + line.y(),
          radius: 5,
          fill: 'white',
          stroke: 'blue',
          strokeWidth: 1,
          draggable: true,
          visible: true,
        });
      
        const legAnchor2 = new Konva.Circle({
          x: line.points()[2] + line.x(),
          y: line.points()[3] + line.y(),
          radius: 5,
          fill: 'white',
          stroke: 'blue',
          strokeWidth: 1,
          draggable: true,
          visible: true,
        });

        line.setAttrs({
          draggable: true,
          name: 'offsetIsOn',
        });

        dimLeg1.setAttrs({
          points: [line.points()[0],
                  line.points()[1],
                  dimAnchor1.x(),
                  dimAnchor1.y()],
          visible: true,
        });
      
        dimLeg2.setAttrs({
          points: [line.points()[2],
                  line.points()[3],
                  dimAnchor2.x(),
                  dimAnchor2.y()],
          visible: true,
        });

        // layer.add(dimLeg1);
        // layer.add(dimLeg2);
        layer.add(legAnchor1);
        layer.add(legAnchor2);
        layer.add(dimAnchor1);
        layer.add(dimAnchor2);

        dimAnchor1.on('dragmove.drag1', () => {
          line.setAttrs({
            points: [
              dimAnchor1.x(),
              dimAnchor1.y(),
              dimAnchor2.x(),
              dimAnchor2.y()]
          });
    
          dimLeg1.setAttrs({
            points: [line.points()[0],
                    line.points()[1],
                    legAnchor1.x(),
                    legAnchor1.y()],
            visible: true,
          });
        
          dimLeg2.setAttrs({
            points: [line.points()[2],
                    line.points()[3],
                    legAnchor2.x(),
                    legAnchor2.y()],
            visible: true,
          });

          if(text.name() != 'stopHinge') {
            text.setAttrs({
              draggable: true,
              x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
              y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
              offsetX: 0,
              offsetY: 0,
            });
    
            textBackground.setAttrs({
              x: text.x(),
              y: text.y(),
            });
    
            if(text.name() == ''){
              text.setAttrs({
                draggable: false,
              });
            };
          };
    
          connectorLine.setAttrs({
            points: [(line.points()[0] + line.points()[2]) / 2,
            (line.points()[1] + line.points()[3]) / 2,
            text.x() + text.width() / 2,
            text.y() + text.height() / 2],
          });
        });
    
        dimAnchor2.on('dragmove.drag2', () => {
          line.setAttrs({
            points: [
              dimAnchor1.x(),
              dimAnchor1.y(),
              dimAnchor2.x(),
              dimAnchor2.y()]
          });
    
          dimLeg1.setAttrs({
            points: [line.points()[0],
                    line.points()[1],
                    legAnchor1.x(),
                    legAnchor1.y()],
            visible: true,
          });
        
          dimLeg2.setAttrs({
            points: [line.points()[2],
                    line.points()[3],
                    legAnchor2.x(),
                    legAnchor2.y()],
            visible: true,
          });

          if(text.name() != 'stopHinge') {
            text.setAttrs({
              draggable: true,
              x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
              y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
              offsetX: 0,
              offsetY: 0,
            });
    
            textBackground.setAttrs({
              x: text.x(),
              y: text.y(),
            });
    
            if(text.name() == ''){
              text.setAttrs({
                draggable: false,
              });
            }
          };
    
          connectorLine.setAttrs({
            points: [(line.points()[0] + line.points()[2]) / 2,
            (line.points()[1] + line.points()[3]) / 2,
            text.x() + text.width() / 2,
            text.y() + text.height() / 2],
          });
        });

        legAnchor1.on('dragmove.drag3', () => {
          dimLeg1.setAttrs({
            points: [line.points()[0],
                    line.points()[1],
                    legAnchor1.x(),
                    legAnchor1.y()],
            visible: true,
          });
        
          dimLeg2.setAttrs({
            points: [line.points()[2],
                    line.points()[3],
                    legAnchor2.x(),
                    legAnchor2.y()],
            visible: true,
          });

          if(text.name() != 'stopHinge') {
            text.setAttrs({
              draggable: true,
              x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
              y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
              offsetX: 0,
              offsetY: 0,
            });
    
            textBackground.setAttrs({
              x: text.x(),
              y: text.y(),
            });
    
            if(text.name() == ''){
              text.setAttrs({
                draggable: false,
              });
            };
          };
    
          connectorLine.setAttrs({
            points: [(line.points()[0] + line.points()[2]) / 2,
            (line.points()[1] + line.points()[3]) / 2,
            text.x() + text.width() / 2,
            text.y() + text.height() / 2],
          });
        });

        legAnchor2.on('dragmove.drag4', () => {
          dimLeg1.setAttrs({
            points: [line.points()[0],
                    line.points()[1],
                    legAnchor1.x(),
                    legAnchor1.y()],
            visible: true,
          });
        
          dimLeg2.setAttrs({
            points: [line.points()[2],
                    line.points()[3],
                    legAnchor2.x(),
                    legAnchor2.y()],
            visible: true,
          });

          if(text.name() != 'stopHinge') {
            text.setAttrs({
              draggable: true,
              x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
              y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
              offsetX: 0,
              offsetY: 0,
            });
    
            textBackground.setAttrs({
              x: text.x(),
              y: text.y(),
            });
    
            if(text.name() == ''){
              text.setAttrs({
                draggable: false,
              });
            };
          };
    
          connectorLine.setAttrs({
            points: [(line.points()[0] + line.points()[2]) / 2,
            (line.points()[1] + line.points()[3]) / 2,
            text.x() + text.width() / 2,
            text.y() + text.height() / 2],
          });
        });

        line.on('dragmove.drag5', () => {
          dimAnchor1.setAttrs({
            x: line.points()[0] + line.x(),
            y: line.points()[1] + line.y(),
          });
    
          dimAnchor2.setAttrs({
            x: line.points()[2] + line.x(),
            y: line.points()[3] + line.y(),
          });
    
          dimLeg1.setAttrs({
            points: [dimAnchor1.x(),
                    dimAnchor1.y(),
                    legAnchor1.x(),
                    legAnchor1.y()],
            visible: true,
          });
        
          dimLeg2.setAttrs({
            points: [dimAnchor2.x(),
                    dimAnchor2.y(),
                    legAnchor2.x(),
                    legAnchor2.y()],
            visible: true,
          });

          if(text.name() != 'stopHinge'){
            text.setAttrs({
              draggable: true,
              x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
              y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
              // offsetX: 0,
              // offsetY: 0,
            });
        
            textBackground.setAttrs({
              x: text.x(),
              y: text.y(),
            });
          }
        });

        function eventCloser(e) {
        let evtobj = window.evt? evt : e
        if (evtobj.keyCode == 13 || evtobj.keyCode == 27 || evtobj.keyCode == 90){
          line.setAttrs({
            draggable: false,
          });
          dimAnchor1.off('dragmove.drag1');
          dimAnchor2.off('dragmove.drag2');
          legAnchor1.off('dragmove.drag3');
          legAnchor2.off('dragmove.drag4');
          line.off('dragmove.drag5');
          dimAnchor1.destroy();
          dimAnchor2.destroy();
          legAnchor1.destroy();
          legAnchor2.destroy();

          line.on('click.ctrlClick2', onCtrlClick);
          window.removeEventListener('keydown', eventCloser);
        }
        };

        window.addEventListener('keydown', eventCloser);
      } else if (line.name() == 'offsetIsOn'){
        line.setAttrs({
          points: [dimLeg1.points()[2],
                   dimLeg1.points()[3],
                   dimLeg2.points()[2],
                   dimLeg2.points()[3],
          ],
          draggable: false,
          name: ''
        });

        if(text.name() != 'stopHinge') {
          text.setAttrs({
            draggable: true,
            x: (line.points()[0] + line.points()[2]) / 2 + line.x() - text.width() / 2,
            y: (line.points()[1] + line.points()[3]) / 2 + line.y() - text.height() / 2,
            offsetX: 0,
            offsetY: 0,
          });
  
          textBackground.setAttrs({
            x: text.x(),
            y: text.y(),
          });
  
          if(text.name() == ''){
            text.setAttrs({
              draggable: false,
            });
          };
        };
        connectorLine.setAttrs({
          points: [(line.points()[0] + line.points()[2]) / 2,
          (line.points()[1] + line.points()[3]) / 2,
          text.x() + text.width() / 2,
          text.y() + text.height() / 2],
        });

        dimLeg1.setAttrs({
          visible: false
        });
        dimLeg2.setAttrs({
          visible: false
        });

        line.on('click.ctrlClick2', onCtrlClick);
      }
    }
  }

  line.on('click.ctrlClick2', onCtrlClick);
  line.on('dblclick.doubleClick1', onDoubleClick);
}

function rectTransformer(rect, layer) {

  function onDoubleClick(){
    rect.off('dblclick.doubleClick1');
    let rectData = [rect.x(), rect.y(), rect.width(), rect.height()];

    rect.setAttrs({
      draggable: true,
    });

    const anchor1 = new Konva.Circle({
      x: rect.x(),
      y: rect.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });
  
    const anchor2 = new Konva.Circle({
      x: rect.x() + rect.width(),
      y: rect.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });

    const anchor3 = new Konva.Circle({
      x: rect.x() + rect.width(),
      y: rect.y() + rect.height(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });
  
    const anchor4 = new Konva.Circle({
      x: rect.x(),
      y: rect.y() + rect.height(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });

    layer.add(anchor1);
    layer.add(anchor2);
    layer.add(anchor3);
    layer.add(anchor4);

    anchor1.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor2.setAttrs({
      visible: true,
      draggable: true,
    });
    
    anchor3.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor4.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor1.on('dragmove.drag1', () => {
      rect.setAttrs({
        x: anchor1.x(),
        y: anchor1.y(),
        width: Math.abs(rectData[0] + rectData[2]) - anchor1.x(),
        height: Math.abs(rectData[1] + rectData[3]) - anchor1.y(),
      });

      rectData = [rect.x(), rect.y(), rect.width(), rect.height()];
      updateAnchors();
    });

    anchor2.on('dragmove.drag2', () => {
      rect.setAttrs({
        y: anchor2.y(),
        width: anchor2.x() - anchor1.x(),
        height: anchor3.y() - anchor2.y(),
      });

      rectData = [rect.x(), rect.y(), rect.width(), rect.height()];
      updateAnchors();
    });

    anchor3.on('dragmove.drag3', () => {
      rect.setAttrs({
        width: anchor3.x() - anchor1.x(),
        height: anchor3.y() - anchor1.y(),
      });

      rectData = [rect.x(), rect.y(), rect.width(), rect.height()];
      updateAnchors();
    });

    anchor4.on('dragmove.drag4', () => {
      rect.setAttrs({
        x: anchor4.x(),
        width: anchor2.x() - anchor4.x(),
        height: anchor4.y() - anchor1.y(),
      });

      rectData = [rect.x(), rect.y(), rect.width(), rect.height()];
      updateAnchors();
    });


    function updateAnchors(){
      anchor1.setAttrs({
        x: rect.x(),
        y: rect.y(),
      });

      anchor2.setAttrs({
        x: rect.x() + rect.width(),
        y: rect.y(),
      });

      anchor3.setAttrs({
        x: rect.x() + rect.width(),
        y: rect.y() + rect.height(),
      });

      anchor4.setAttrs({
        x: rect.x(),
        y: rect.y() + rect.height(),
      });
    }

    rect.on('dragmove.drag5', () => {
      updateAnchors();
    });

    colorFieldset.addEventListener('click', changeShapeColor);
    strokeWidthFieldset.addEventListener('click', changeShapeStrokeWidth);

    function changeShapeColor(){
      let newColor = document.forms.shapeForm.elements.color.value;
      rect.setAttrs({
        stroke: `${newColor}`,
      });
    };

    function changeShapeStrokeWidth(){
      let newStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;
      rect.setAttrs({
        strokeWidth: `${newStrokeWidth}`,
      });
    };

    function eventCloser(e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13 || evtobj.keyCode == 27){
        rect.setAttrs({
          draggable: false,
        });
        rect.off('dragmove.drag1');
        rect.off('dragmove.drag2');
        rect.off('dragmove.drag3');
        rect.off('dragmove.drag4');
        rect.off('dragmove.drag5');
        anchor1.destroy();
        anchor2.destroy();
        anchor3.destroy();
        anchor4.destroy();
        rect.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 46 || evtobj.keyCode == 8){
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        anchor3.off('dragmove.drag3');
        anchor4.off('dragmove.drag4');
        rect.off('dragmove.drag5');
        anchor1.destroy();
        anchor2.destroy();
        anchor3.destroy();
        anchor4.destroy();
        redoList.push(rect);
        rect.remove();
        rect.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 90 && evtobj.ctrlKey){
        rect.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        anchor3.off('dragmove.drag3');
        anchor4.off('dragmove.drag4');
        rect.off('dragmove.drag5');
        anchor1.destroy();
        anchor2.destroy();
        anchor3.destroy();
        anchor4.destroy();
        rect.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      };
    }

    window.addEventListener('keydown', eventCloser);
  }

  rect.on('dblclick.doubleClick1', onDoubleClick);
}

function circleTransformer(circle, layer) {
  function onDoubleClick(){
    circle.off('dblclick.doubleClick1');
    const anchor1 = new Konva.Circle({
      x: circle.x(),
      y: circle.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });
  
    const anchor2 = new Konva.Circle({
      x: circle.x() + circle.radius(),
      y: circle.y(),
      radius: 10,
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 1,
      draggable: false,
      visible: false,
    });

    circle.setAttrs({
      draggable: true,
    });

    layer.add(anchor1);
    layer.add(anchor2);

    anchor1.setAttrs({
      visible: true,
      draggable: true,
    });

    anchor2.setAttrs({
      visible: true,
      draggable: true,
    });
    

    anchor1.on('dragmove.drag1', () => {
      circle.setAttrs({
        x: anchor1.x(),
        y: anchor1.y()
      });

      anchor2.setAttrs({
        x: circle.x() + circle.radius(),
        y: circle.y(),
      });
    });

    anchor2.on('dragmove.drag2', () => {
      circle.setAttrs({
        radius: Math.sqrt(Math.pow((anchor2.x() - anchor1.x()), 2) + Math.pow((anchor2.y() - anchor1.y()), 2)),
      });
    });

    circle.on('dragmove.drag3', () => {
      anchor1.setAttrs({
        x: circle.x(),
        y: circle.y(),
      });

      anchor2.setAttrs({
        x: circle.x() + circle.radius(),
        y: circle.y(),
      });
    });

    colorFieldset.addEventListener('click', changeShapeColor);
    strokeWidthFieldset.addEventListener('click', changeShapeStrokeWidth);

    function changeShapeColor(){
      let newColor = document.forms.shapeForm.elements.color.value;
      circle.setAttrs({
        stroke: `${newColor}`,
      });
    };

    function changeShapeStrokeWidth(){
      let newStrokeWidth = document.forms.shapeForm.elements.strokeWidth.value;
      circle.setAttrs({
        strokeWidth: `${newStrokeWidth}`,
      });
    };

    function eventCloser(e) {
      let evtobj = window.evt? evt : e
      if (evtobj.keyCode == 13 || evtobj.keyCode == 27){
        circle.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        circle.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        circle.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 46 || evtobj.keyCode == 8){
        circle.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        circle.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        redoList.push(line);
        circle.remove();
        circle.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      }else if(evtobj.keyCode == 90 && evtobj.ctrlKey){
        circle.setAttrs({
          draggable: false,
        })
        anchor1.off('dragmove.drag1');
        anchor2.off('dragmove.drag2');
        circle.off('dragmove.drag3');
        anchor1.destroy();
        anchor2.destroy();
        circle.on('dblclick.doubleClick1', onDoubleClick);
        window.removeEventListener('keydown', eventCloser);
        colorFieldset.removeEventListener('click', changeShapeColor);
        strokeWidthFieldset.removeEventListener('click', changeShapeStrokeWidth);
      };
    };

    window.addEventListener('keydown', eventCloser);
  }

  circle.on('dblclick.doubleClick1', onDoubleClick);
}

function clearKonva(layer){
  layer.destroyChildren();
  shapeList.length = 0;
  redoList.length = 0;
}
export {draw, undo, redo, clearKonva}