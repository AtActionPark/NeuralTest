var dataFileBuffer;  
var labelFileBuffer;
var pixelValues;
var pixelValuesTest;

//Reads MNIST files and store set data in pixelValue
function buildTrainingSet(event){
  var size = event.data.trainingSize
  pixelValues = new Array(size)
  for (var image = 0; image < size; image++) { 
    var pixels = new Array(784);
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels[28*y+x] = dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255;
        }
    }
    console.log('...Building Training Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: arrayToMatrix(pixels), output: arrayToMatrix(labelToArray(output))}
    pixelValues[image] = o
  }
  console.log('Training Set built')
  return pixelValues
}

//Reads MNIST files and store set data in pixelValueTest
function buildTestingSet(event){
  var size = event.data.testSize
  pixelValuesTest = new Array(size)
  for (var image = 0; image < size; image++) { 
    var pixels = new Array(784);
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels[28*y+x] = dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255;
        }
    }
    console.log('...Building Testing Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: arrayToMatrix(pixels), output: arrayToMatrix(labelToArray(output))}
    pixelValuesTest[image] = o
 }
 console.log('Testing Set built')
 return pixelValuesTest
}

//Transform the set into needed format
function formatSet(set){
  var result  = new Array(set.length);
  for(var i = 0;i<set.length;i++){
    console.log('...Formating set')
    result[i] = new Array(2)
    result[i][0] = set[i].input
    result[i][1] = set[i].output
  } 
  return result
}


