//Set the size of the sets
//Max is 60000 for training and 10000 for testing
var trainingSize = 600
var testSize = 100


//Set the network number and size of layers 
var size = [784,30,10]

var trainingData 
var testData 
var result = [[],[],[],[]]

//empty matrix object, for calc
var m = new Matrix();

//initial network
var n;

//web worker for long running stuff
//created with a text blob to bypass local worker usage impossibility
var worker = new Worker(URL.createObjectURL(new Blob(["("+trainNumbersWorker.toString()+")()"], {type: 'text/javascript'})));

//loads result from training into the global scope network
worker.onmessage = function(event){
	n.weights = event.data.weights;
	n.biases = event.data.biases;
	//load training cost
	event.data.result[0].forEach(function(r){
		result[0].push(r)
	})
	//load training accuracy
	event.data.result[1].forEach(function(r){
		result[1].push(r)
	})
	//load testing cost
	event.data.result[2].forEach(function(r){
		result[2].push(r)
	})
	//load testing accuracy
	event.data.result[3].forEach(function(r){
		result[3].push(r)
	})
	plot(result,true,true,true,true)
}

$(document).ready(function(){
	document.getElementById('trainingInput').addEventListener('change', readData, false);
	document.getElementById('trainingLabel').addEventListener('change', readLabel, false);
	document.getElementById('testingInput').addEventListener('change', readData, false);
	document.getElementById('testingLabel').addEventListener('change', readLabel, false);
	$("#buildTraining").on('click',{trainingSize: trainingSize}, buildTrainingSet);
	$("#buildTesting").on('click',{testSize: testSize}, buildTestingSet);
	$("#format").on('click', formatSets);
	$("#init").on('click', initNet);
	$("#train").on('click', trainWorker);
	
	$("#guess").on('click', guess);
	$("#showProcess").on('change', toggleProcess);
	$("#showTools").on('change', toggleTools);

    initCanvas()
    resultCanvas()
    graphCanvas()
    load()
})

//MNIST sets need to be formated to the network input style
//slice the sets to desired size, format them and post them to the worker
//If the set is too big to be sent to thw worker in one pass, it needs to be batched
function formatSets(event){
	//if test size < max test size, shuffle the sets
	//to ensure we take a random sample
	trainingSet = shuffle(pixelValues)
	testSet = shuffle(pixelValuesTest)

	trainingData =  formatSet(trainingSet)
	testData =  formatSet(testSet)
	console.log("Set formated")
	
	var batchNb = 10
	for(var i = 0;i< batchNb;i++){
		var trainingData1 = trainingData.splice(0,trainingSize/batchNb)
		var testData1 = testData.splice(0,testSize/batchNb)
		worker.postMessage({trainingData: trainingData1})
		setTimeout(worker.postMessage({testData: testData1}),50)
		console.log("...Posting batch data to worker: " + i + "/" + batchNb)
	}
	console.log('Data posted')

}

//reset the network with random weight and biases
function initNet(){
	n = new Network(size,new CrossEntropyCost)
	n.init()
	console.log("Network created")
	//drawTest(1)

}

//start the train function on the worker
function trainWorker(){
	worker.postMessage({start: true, n: n})
}

//Worker functions: treat set data and run SGD
function trainNumbersWorker(){
	importScripts('file:///C:/Users/clementmatheron/Desktop/Prog/neuralTest/js/helpers.js') 
	importScripts('file:///C:/Users/clementmatheron/Desktop/Prog/neuralTest/js/matrix.js') 
	importScripts('file:///C:/Users/clementmatheron/Desktop/Prog/neuralTest/js/network.js') 

	self.trainingData = []
	self.testData = []

	onmessage = function(event){
		if(event.data.trainingData){
			event.data.trainingData.forEach(function(v) {self.trainingData.push(v),this});     
			console.log("Data batch received")
		}
		if(event.data.testData){
			event.data.testData.forEach(function(v) {self.testData.push(v)});   
			console.log("Data batch received")
		}

		// main function: run the SGD algo on the network
		// needs to be on a separate thread for big sets
    	if(event.data.start){
    		var start = new Date().getTime();
	    	n = new Network(event.data.n.sizes,new CrossEntropyCost)
	    	n.weights = event.data.n.weights;
    		n.biases = event.data.n.biases;

			console.log("Training network")
			var result = n.SGD(trainingData,1,10,0.1,5.0,testData, true, true, true, true)
			var end = new Date().getTime();
			var time = end - start;
			console.log('Execution time: ' + time);
			postMessage({weights: n.weights,biases:n.biases, result: result})
    	}
	}	
}



// process the drawing, feeds it to the network, returns result and resets canvas
function guess(offsetX,offsetY){
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	var input = preprocess()
	var feed = n.feedforward(arrayToMatrix(input)).m[0]
	//console.log("computed input")
	console.log(feed)
	//check all outputs a return the index of the one with max value
	var max = -1
	var index = 0
	feed.forEach(function(f,i){
		if(f >max){
			max = f;
			index = i
		}
	})

	$("#result").html(index)
	
	//reset drawing
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();	
}

//create a download link with network data
function save(){
  data = {size: n.sizes, weights: n.weights, biases: n.biases}
  var link = document.getElementById('downloadlink');
  link.href = makeTextFile(JSON.stringify(data));
  link.style.display = 'block';
}

var textFile = null,
makeTextFile = function (text) {
  var data = new Blob([text], {type: 'text/plain'});
  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }
  textFile = window.URL.createObjectURL(data);
  return textFile;
};

//read the values in saved.js to load network
function load(){
  n = new Network(saved.size,new CrossEntropyCost)
  n.weights = saved.weights
  n.biases = saved.biases
}

function toggleProcess(){
	$("#resultCanvasDiv").toggle()
}
function toggleTools(){
	$("#trainingTools").toggle()
}

function drawTest(digit){
  var imageData = context.getImageData(0,0, 28, 28);
  var r = 0
  while(trainingData[r][1].m[0][digit] != 1){
  	var r = Math.floor(Math.random()*trainingData.length)
  }
  console.log(r)
  r = 406
  var t = trainingData[r][0].m[0]

  for (var i = 0; i < t.length; i+=1)
  {
    imageData.data[i * 4] = 255-t[i]*255 ;
    imageData.data[i * 4 + 1] = 255-t[i]*255 ;
    imageData.data[i * 4 + 2] = 255-t[i]*255 ;
    imageData.data[i * 4 + 3] = 255;
  }

	var newCanvas = $("<canvas>")
    .attr("width", imageData.width)
    .attr("height", imageData.height)[0];

	newCanvas.getContext("2d").putImageData(imageData, 0, 0);

	context.save()
	context.scale(10, 10);
	context.drawImage(newCanvas, 0, 0);
	context.restore()

	var feed = n.feedforward(arrayToMatrix(t)).m[0]
	//console.log("original input")
	console.log(feed)
	var max = -1
	var index = 0
	feed.forEach(function(f,i){
		if(f >max){
			max = f;
			index = i
		}
	})
	$("#result").html(index)
}

















