var originalCanvas
var resultCanvas
var graphCanvas
var context
var resultContext
var graphContext
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

//Initialize the canvas that will receive the post processed drawing
function resultCanvas(){
	var canvasWidth = 280
	var canvasHeight = 280
	var canvasDiv = document.getElementById('resultCanvasDiv');
	resultCanvas = document.createElement('canvas');
	resultCanvas.setAttribute('width', canvasWidth);
	resultCanvas.setAttribute('height', canvasHeight);
	resultCanvas.setAttribute('id', 'resultCanvas');
	canvasDiv.appendChild(resultCanvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		resultCanvas = G_vmlCanvasManager.initElement(resultCanvas);
	}
	resultContext = resultCanvas.getContext("2d");
}

//Initialize the drawing canvas
function initCanvas(){
	var canvasWidth = 280
	var canvasHeight = 280
	var canvasDiv = document.getElementById('canvasDiv');
	originalCanvas = document.createElement('canvas');
	originalCanvas.setAttribute('width', canvasWidth);
	originalCanvas.setAttribute('height', canvasHeight);
	originalCanvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(originalCanvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		originalCanvas = G_vmlCanvasManager.initElement(originalCanvas);
	}
	context = originalCanvas.getContext("2d");

	$('#canvas').mousedown(function(e){
	  var mouseX = e.pageX - this.offsetLeft;
	  var mouseY = e.pageY - this.offsetTop;
			
	  paint = true;
	  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
	  redraw();
	});

	$('#canvas').mousemove(function(e){
	  if(paint){
	    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
	    redraw();
	  }
	});

	$('#canvas').mouseup(function(e){
	  paint = false;
	});

	$('#canvas').mouseleave(function(e){
	  paint = false;
	});		
}

//Keep track of the mouse path
function addClick(x, y, dragging){
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 22;
			
  for(var i=0; i < clickX.length; i++) {		
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

function reset(){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();
}

// computes center of mass of digit, for centering
// note 1 stands for black (0 white) so we have to invert.
function centerImage(img) {
	var meanX = 0;
	var meanY = 0;
	var rows = img.length;
	var columns = img[0].length;
	var sumPixels = 0;
	for (var y = 0; y < rows; y++) {
	  for (var x = 0; x < columns; x++) {
	    var pixel = (1 - img[y][x]);
	    sumPixels += pixel;
	    meanY += y * pixel;
	    meanX += x * pixel;
	  }
	}
	meanX /= sumPixels;
	meanY /= sumPixels;

	var dY = Math.round(rows/2 - meanY);
	var dX = Math.round(columns/2 - meanX);
	return {transX: dX, transY: dY};
}

// given grayscale image, find bounding rectangle of digit defined
// by above-threshold surrounding
function getBoundingRectangle(img, threshold) {
	var rows = img.length;
	var columns = img[0].length;
	var minX=columns;
	var minY=rows;
	var maxX=-1;
	var maxY=-1;
	for (var y = 0; y < rows; y++) {
	  for (var x = 0; x < columns; x++) {
	    if (img[y][x] < threshold) {
	      if (minX > x) minX = x;
	      if (maxX < x) maxX = x;
	      if (minY > y) minY = y;
	      if (maxY < y) maxY = y;
	    }
	  }
	}
	return { minY: minY, minX: minX, maxY: maxY, maxX: maxX};
}

// take canvas image and convert to grayscale. Mainly because my
// own functions operate easier on grayscale, but some stuff like
// resizing and translating is better done with the canvas functions
function imageDataToGrayscale(imgData) {
	var grayscaleImg = [];
	for (var y = 0; y < imgData.height; y++) {
	  grayscaleImg[y]=[];
	  for (var x = 0; x < imgData.width; x++) {
	    var offset = y * 4 * imgData.width + 4 * x;
	    var alpha = imgData.data[offset+3];
	    // weird: when painting with stroke, alpha == 0 means white;
	    // alpha > 0 is a grayscale value; in that case I simply take the R value
	    if (alpha == 0) {
	      imgData.data[offset] = 255;
	      imgData.data[offset+1] = 255;
	      imgData.data[offset+2] = 255;
	    }
	    imgData.data[offset+3] = 255;
	    // simply take red channel value. Not correct, but works for
	    // black or white images.
	    grayscaleImg[y][x] = imgData.data[y*4*imgData.width + x*4 + 0] / 255;
	  }
	}
	return grayscaleImg;
}

// takes the image in the canvas, centers & resizes it, then puts into 10x10 px bins
// to give a 28x28 grayscale image
function preprocess() {

	// convert RGBA image to a grayscale array, then compute bounding rectangle and center of mass  
	var imgData = context.getImageData(0, 0, 280, 280);
	grayscaleImg = imageDataToGrayscale(imgData);
	var boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
	var trans = centerImage(grayscaleImg); // [dX, dY] to center of mass

	// copy image to hidden canvas, translate to center-of-mass, then
	// scale to fit into a 200x200 box (see MNIST calibration notes on
	// Yann LeCun's website)
	var canvasCopy = document.createElement("canvas");
	canvasCopy.width = imgData.width;
	canvasCopy.height = imgData.height;
	var copyCtx = canvasCopy.getContext("2d");
	var brW = boundingRectangle.maxX+1-boundingRectangle.minX;
	var brH = boundingRectangle.maxY+1-boundingRectangle.minY;
	var scaling = 190 / (brW>brH?brW:brH);
	// scale
	copyCtx.translate(canvas.width/2, canvas.height/2);
	copyCtx.scale(scaling, scaling);
	copyCtx.translate(-canvas.width/2, -canvas.height/2);
	// translate to center of mass
	copyCtx.translate(trans.transX, trans.transY);


	// default take image from original canvas
	copyCtx.drawImage(context.canvas, 0, 0);
	

	// now bin image into 10x10 blocks (giving a 28x28 image)
	imgData = copyCtx.getImageData(0, 0, 280, 280);
	grayscaleImg = imageDataToGrayscale(imgData);
	var nnInput = [];
	for (var y = 0; y < 28; y++) {
	  for (var x = 0; x < 28; x++) {
	    var mean = 0;
	    for (var v = 0; v < 10; v++) {
	      for (var h = 0; h < 10; h++) {
	        mean += grayscaleImg[y*10 + v][x*10 + h];

	      }
	    }
	    mean = (1-mean / 100); // average and invert
	    nnInput.push(mean)
	  }
	}

	// for visualization/debugging: paint the input to the neural net.
	resultContext.clearRect(0, 0, canvas.width, canvas.height);

    resultContext.drawImage(copyCtx.canvas, 0, 0);
	for (var y = 0; y < 28; y++) {
		for (var x = 0; x < 28; x++) {
		  var block = resultContext.getImageData(x * 10, y * 10, 10, 10);
		  var newVal = 255-255 * (nnInput[x*28+y]);
		  for (var i = 0; i < 4 * 10 * 10; i+=4) {
		    block.data[i] = newVal;
		    block.data[i+1] = newVal;
		    block.data[i+2] = newVal;
		    block.data[i+3] = 255;
		  }
		  resultContext.putImageData(block, y * 10, x * 10);
		}
	}
	return nnInput
}


//Initialize the canvas that will receive the graph
function graphCanvas(){
	var canvasWidth = 600
	var canvasHeight = 400
	var canvasDiv = document.getElementById('graphCanvasDiv');
	graphCanvas = document.createElement('canvas');
	graphCanvas.setAttribute('width', canvasWidth);
	graphCanvas.setAttribute('height', canvasHeight);
	graphCanvas.setAttribute('id', 'graphCanvas');
	canvasDiv.appendChild(graphCanvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		graphCanvas = G_vmlCanvasManager.initElement(graphCanvas);
	}
	graphContext = graphCanvas.getContext("2d");
}

function rescale(valueIn, baseMin,baseMax, limitMin,limitMax){
	return ((limitMax - limitMin) * (valueIn - baseMin) / (baseMax - baseMin)) + limitMin;
}

function plot(data,s1,s2,s3,s4){
	var margin = 30
	var w = graphContext.canvas.width
	var h = graphContext.canvas.height
	var h2 = h - margin

	var serie1 = data[0] || [[]]
	var max1 = serie1[0]
	var serie2 = data[1] || [[]]
	var min2 = serie2[0]

	var serie3 = data[2] || [[]]
	var max3 = serie3[0]
	var serie4 = data[3] || [[]]
	var min4 = serie4[0]

	
	var n = serie1.length
	var istep = (w-2*margin)/(n-1)

	var max = Math.max(max1,max3)
	var min = Math.min(min2,min4)
	
	

	graphContext.clearRect(0, 0, graphContext.canvas.width, graphContext.canvas.height); 
  	graphContext.lineJoin = "round";
  	graphContext.lineWidth = 1;
  	graphContext.font = "15px Arial";
  	graphContext.strokeStyle = "#000000";

  	//x axis + legend
  	graphContext.beginPath();
	graphContext.moveTo(margin, h-margin);
	graphContext.lineTo(w-margin, h-margin);
	graphContext.closePath();
	graphContext.stroke();

	graphContext.fillText(n-1,w-margin -15 ,h-margin+15);
	graphContext.fillText(0,margin,h-margin+15);

	//y axis + legend left
	graphContext.beginPath();
	graphContext.moveTo(margin, 0);
	graphContext.lineTo(margin, h-margin);
	graphContext.closePath();
	graphContext.stroke();

	graphContext.fillText(Math.round(max * 10) / 10,Math.max(margin -30,0),15);
	graphContext.fillText(0,Math.max(margin -30,0),h-margin);

	//y axis + legend right
	graphContext.beginPath();
	graphContext.moveTo(w-margin, 0);
	graphContext.lineTo(w-margin, h-margin);
	graphContext.closePath();
	graphContext.stroke();


	graphContext.fillText(1,Math.min(w-margin+10,w-15),15);
	graphContext.fillText(Math.round(min * 10) / 10,Math.min(w-margin+10,w-15),h-margin);

	

  	if(s1){
		for(var i=0; i < serie1.length-1; i++) {
			graphContext.strokeStyle = "#008000";		
			graphContext.beginPath();
			graphContext.moveTo(margin+i*istep, h2-serie1[i]/max*h2 );
			graphContext.lineTo(margin+(i+1)*istep, h2-serie1[i+1]/max*h2);
			graphContext.closePath();
			graphContext.stroke();

			//draw ticks on x axis
			graphContext.strokeStyle = "#000000";
			graphContext.beginPath();
			graphContext.moveTo(margin+(i+1)*istep, h-margin);
			graphContext.lineTo(margin+(i+1)*istep, h-margin+5);
			graphContext.closePath();
			graphContext.stroke();
		}
  	}
  	if(s2){
  		graphContext.strokeStyle = "#008000";
  		graphContext.save();
  		graphContext.setLineDash([5, 15]);
		for(var i=0; i < serie2.length-1; i++) {		
			graphContext.beginPath();
			graphContext.moveTo(margin+i*istep, h2-(rescale(serie2[i],min,1,0,1 ))*h2);
			graphContext.lineTo(margin+(i+1)*istep, h2-(rescale(serie2[i+1],min,1,0,1 ))*h2);
			graphContext.closePath();
			graphContext.stroke();
		}
  	}
  	if(s3){
  		graphContext.restore();
  		graphContext.strokeStyle = "#ff0000";
		for(var i=0; i < serie3.length-1; i++) {		
			graphContext.beginPath();
			graphContext.moveTo(margin+i*istep, h2-serie3[i]/max*h2 );

			graphContext.lineTo(margin+(i+1)*istep, h2-serie3[i+1]/max*h2);
			graphContext.closePath();
			graphContext.stroke();
		}
  	}
  	if(s4){
  		graphContext.strokeStyle = "#ff0000";
  		graphContext.save();
  		graphContext.setLineDash([5, 15]);
		for(var i=0; i < serie4.length-1; i++) {		
			graphContext.beginPath();
			graphContext.moveTo(margin+i*istep, h2-(rescale(serie4[i],min,1,0,1 ))*h2);

			graphContext.lineTo(margin+(i+1)*istep, h2-(rescale(serie4[i+1],min,1,0,1 ))*h2);
			graphContext.closePath();
			graphContext.stroke();
		}
  	}
  	graphContext.restore();
}