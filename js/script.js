var m = new Matrix();
var trainingData;
var validationData;
var testData;
var testImage;
var originalCanvas
var resultCanvas
var context
var resultContext
var testSet

var n;

$(document).ready(function(){

	$("#guess").on('click', function () {
        guess()
      });
	$("#reset").on('click', function () {
        reset()
      });

    initCanvas()
    resultCanvas()
    load()

	//trainNumbers()
	//trainRandomVectors() 
	//loadTest()
})

function trainRandomVectors(){
	var trainingData = new LearningData(500).samples
	var validationData = new TestingData(100).samples

	n = new Network([2,10,2], new CrossEntropyCost)
	n.init()

	console.log("Training network")
	n.SGD(trainingData,30,10,3,0.1,validationData, true, true, true, true)
}
function trainNumbers(){
	n = new Network([784,30,10],new CrossEntropyCost)
	n.init()
	console.log("Building Set")
	MNISTLoad()
    var set = mnist.set(8000, 2000);
	var trainingSet = set.training;
	var testSet = set.test;
	
	trainingData = new buildSet(trainingSet).samples
	validationData = new buildSet(testSet).samples
	console.log("Set Built")

	console.log("Training network")
	n.SGD(trainingData,30,10,0.1,3.0,validationData, false, true, false, false)
	console.log("Network Trained")
}
function loadTest(){
	load()
	MNISTLoad()
    var set = mnist.set(8000, 2000);
	var testSet = set.test;
	testData = new buildSet(testSet).samples
	var eval = n.accuracy(testData)
	var nTest = testData.length
	console.log("accuracy: " + eval/nTest*100+ "%")
}


function guess(offsetX,offsetY){
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	
	var input = preprocess()
	
	var feed = n.feedforward(arrayToMatrix(input)).m[0]
	var max = 0
	var index = 0
	feed.forEach(function(f,i){
		if(f >max){
			max = f;
			index = i
		}
	})

	//results consistent but not ordered?
	var result = 0
	if(index==0)
		result = 8
	else if(index==1)
		result = 1 
	else if(index==2)
		result = 4 
	else if(index==3)
		result = 6 
	else if(index==4)
		result = 2 
	else if(index==5)
		result = 5 
	else if(index==6)
		result = 9 
	else if(index==7)
		result = 3 
	else if(index==8)
		result = 7 
	else if(index==9)
		result = 0 
	console.log(result)
	$("#result").html(result)
	
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();	
}


function reset(){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();
}




//canvas
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

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

function addClick(x, y, dragging){
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 25;
			
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
// to give a 28x28 grayscale image; then, computes class probability via neural network
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