//Set the size of the sets
var trainingSize = 5000
var testSize = 1000


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
	event.data.result[0].forEach(function(r){
		result[0].push(r)
	})
	event.data.result[1].forEach(function(r){
		result[1].push(r)
	})
	event.data.result[2].forEach(function(r){
		result[2].push(r)
	})
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
    plot([[50.1,40,30,20,10,0],[0.6,0.6,0.6,0.6,0.6,1],[45,35,25,15,5,0],[0,0.6,0.6,0.7,0.8,0.9]], true, true, true, true)
})

//MNIST sets need to be formated to the network input style
//slice the sets to desired size, format them and post them to the worker
function formatSets(event){
	trainingSet = pixelValues.slice(0,trainingSize)
	testSet = pixelValuesTest.slice(0,testSize)

	trainingData =  formatSet(trainingSet)
	testData =  formatSet(testSet)
	console.log("Set formated")

	console.log("...Posting training")
	worker.postMessage({trainingData: trainingData})
	console.log("...Posting test")
	setTimeout(worker.postMessage({testData: testData}),50)
}

//reset the network with random weight and biases
function initNet(){
	n = new Network(size,new CrossEntropyCost)
	n.init()
	console.log("Network created")
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
			trainingData = event.data.trainingData
			console.log("TrainingData sent to worker")
		}
		if(event.data.testData){
			testData = event.data.testData
			console.log("TestData sent to worker")
		}

		// main function: run the SGD algo on the network
		// needs to be on a separate thread for big sets
    	if(event.data.start){
	    	n = new Network(event.data.n.sizes,new CrossEntropyCost)
	    	n.weights = event.data.n.weights;
    		n.biases = event.data.n.biases;

			console.log("Training network")
			var result = n.SGD(trainingData,30,10,0.1,5.0,testData, true, true, true, true)
			postMessage({weights: n.weights,biases:n.biases, result: result})
    	}
	}	
}







// process the drawing, feeds it to the network, returns result and resets canvas
function guess(offsetX,offsetY){
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	var input = preprocess()
	var feed = n.feedforward(arrayToMatrix(input)).m[0]
	console.log(feed)
	var max = 0
	var index = 0
	feed.forEach(function(f,i){
		if(f >max){
			max = f;
			index = i
		}
	})
	$("#result").html(index)
	
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();	
}

//create a download link with network data
function save(){
  data = {size: n.sizes, weights: n.weights, biases: n.biases}
  //console.log(JSON.stringify(data))
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
  n = new Network(saved.size,CrossEntropyCost)
  n.weights = saved.weights
  n.biases = saved.biases
}

function toggleProcess(){
	$("#resultCanvasDiv").toggle()
}
function toggleTools(){
	$("#trainingTools").toggle()
}












