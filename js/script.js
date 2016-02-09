var m = new Matrix();
var n;
var trainingTools = false

$(document).ready(function(){
	if(trainingTools){
		$('#trainingTools').append("Training Images<input type='file' id='trainingInput' /><br>Training Labels<input type='file' id='trainingLabel' /> <br><button id='buildTraining'>Build Training Set</button><br><br>Testing Images<input type='file' id='testingInput' /><br>Testing Labels<input type='file' id='testingLabel' /> <br><button id='buildTesting'>Build Testing Set</button><br><br><button id='init'>Init network</button><br><br><button id='train'>Train network</button><br><br><a download='info.txt' id='downloadlink' style='display: none'>Download</a>")
		document.getElementById('trainingInput').addEventListener('change', readData, false);
		document.getElementById('trainingLabel').addEventListener('change', readLabel, false);
		document.getElementById('testingInput').addEventListener('change', readData, false);
		document.getElementById('testingLabel').addEventListener('change', readLabel, false);
		$("#buildTraining").on('click', buildTrainingSet);
		$("#buildTesting").on('click', buildTestingSet);
		$("#init").on('click', initNet);
		$("#train").on('click', trainNumbers);
	}
	
	$("#guess").on('click', guess);
	$("#reset").on('click', reset);

    initCanvas()
    resultCanvas()
    load()
})

function initNet(){
	n = new Network([784,30,10],new CrossEntropyCost)
	n.init()
	console.log("Building Set")

	trainingSet = pixelValues.slice(1,40000)
	validationSet = pixelValues.slice(40001)

	trainingData = new buildSet(trainingSet).samples
	validationData = new buildSet(validationSet).samples
}

function trainNumbers(){
	console.log("Training network")
	var result = n.SGD(trainingData,1,10,0.1,5.0,validationData, true, true, true, true)
	console.log(result)
}

function guess(offsetX,offsetY){
	resultContext.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
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

	$("#result").html(index)
	
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();	
}


function readData(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
        var result = new Uint8ClampedArray(e.target.result)
        dataFileBuffer = result;
      }
      r.readAsArrayBuffer(f);
    } else { 
        alert("Failed to load file");
    }
}
function readLabel(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
        var result = new Uint8ClampedArray(e.target.result)
        labelFileBuffer = result;
      }
      r.readAsArrayBuffer(f);
    } else { 
        alert("Failed to load file");
    }
}
function save(){
  data = {size: n.sizes, weights: n.weights, biases: n.biases}
  console.log(JSON.stringify(data))
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
function load(){
  n = new Network(saved.size,CrossEntropyCost)
  n.weights = saved.weights
  n.biases = saved.biases
}











