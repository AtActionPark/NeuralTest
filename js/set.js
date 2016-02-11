var dataFileBuffer;  
var labelFileBuffer;
var pixelValues = [];
var pixelValuesTest = [];

//Reads MNIST files and builds training set
function buildTrainingSet(){
  for (var image = 0; image <= 60000; image++) { 
    var pixels = [];
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255);
        }
    }
    console.log('Building Training Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: pixels, output:labelToArray(output)}
    pixelValues.push(o)
 }
 console.log('Set Built')
}

//Reads MNIST files and builds testing set
function buildTestingSet(){
  for (var image = 0; image <= 10000; image++) { 
    var pixels = [];
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255);
        }
    }
    console.log('Building Testing Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: pixels, output:labelToArray(output)}
    pixelValuesTest.push(o)
 }
 console.log('Set Built')
}

//Transform the set into needed format
function buildSet(set){
  this.samples = [];
  for(var i = 0;i<set.length;i++){
    console.log('set as matrix')
    var input = set[i].input
    var output = set[i].output

    this.samples[i] = []
    this.samples[i].push(arrayToMatrix(input))
    this.samples[i].push(arrayToMatrix(output))
  } 
  console.log('Set built')
}

function draw(digit, context){
  var imageData = context.getImageData(0,0, 28, 28);
  for (var i = 0; i < digit.length; i++)
  {
    imageData.data[i * 4] = digit[i]*255 ;
    imageData.data[i * 4 + 1] = digit[i]*255 ;
    imageData.data[i * 4 + 2] = digit[i]*255 ;
    imageData.data[i * 4 + 3] = 255;
  }
  context.putImageData(imageData,0,0,0,0,280,280);
  console.log(digit)
  console.log(imageData)
}

