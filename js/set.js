var dataFileBuffer;  
var labelFileBuffer;
var pixelValues = [];
var pixelValuesTest = [];

//Reads MNIST files and store set data in pixelValue
function buildTrainingSet(event){
  var size = event.data.trainingSize
  for (var image = 0; image <= size; image++) { 
    var pixels = [];
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255);
        }
    }
    console.log('...Building Training Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: arrayToMatrix(pixels), output: arrayToMatrix(labelToArray(output))}
    pixelValues.push(o)
  }
  console.log('Training Set built')
  return pixelValues
}

//Reads MNIST files and store set data in pixelValueTest
function buildTestingSet(event){
  var size = event.data.testSize
  for (var image = 0; image <= size; image++) { 
    var pixels = [];
    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255);
        }
    }
    console.log('...Building Testing Set')
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: arrayToMatrix(pixels), output: arrayToMatrix(labelToArray(output))}
    pixelValuesTest.push(o)
 }
 console.log('Testing Set built')
 return pixelValuesTest
}

//Transform the set into needed format
function formatSet(set){
  var result  = [];
  for(var i = 0;i<set.length;i++){
    console.log('...Formating set')

    result[i] = []
    result[i].push(set[i].input)
    result[i].push(set[i].output)
  } 
  return result
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

