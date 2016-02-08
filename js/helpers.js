//helpers
function vectorToMatrix(x,y){
	var m = new Matrix(2,1)
	m.m[0][0] = x;
	m.m[0][1] = y;
	return m
}

function arrayToMatrix(arr){
	var l = arr.length
	var m = new Matrix(l,1)
	arr.forEach(function(a,i){
		m.m[0][i] = a
	})

	return m
}

function sigmoid(x){
	return 1.0/(1+Math.exp(-x))
}

function sigmoidPrime(x){
	return sigmoid(x)*(1-sigmoid(x))
}

function zip() {
    var args = [].slice.call(arguments);
    var shortest = args.length==0 ? [] : args.reduce(function(a,b){
        return a.length<b.length ? a : b
    });

    return shortest.map(function(_,i){
        return args.map(function(array){return array[i]})
    });
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function load(){
	n = new Network(saved.size,CrossEntropyCost)
	n.weights = saved.weights
	n.biases = saved.biases
}

function save(){
	data = {size: n.sizes, weights: n.weights, biases: n.biases}
	console.log(JSON.stringify(data))
}

function buildSet(set){
	this.samples = [];

	for(var i = 0;i<set.length;i++){
    console.log('done')
		var input = set[i].input
		var output = set[i].output

		this.samples[i] = []
		this.samples[i].push(arrayToMatrix(input))
		this.samples[i].push(arrayToMatrix(output))
	}	
}

LearningData = function(nb){
	var div = 1
	this.samples = []

	for(var i = 0;i<nb;i++){
		this.samples[i] = []
		var r = Math.random()
		var r2 = (1-2*Math.random())/div
		if(r<0.25){
			this.samples[i].push(vectorToMatrix(0+r2,1+r2))
			this.samples[i].push(vectorToMatrix(0,1))
		}
		else if (r<0.5){
			this.samples[i].push(vectorToMatrix(1+r2,0+r2))
			this.samples[i].push(vectorToMatrix(0,1))
		}
		else if (r<0.75){
			this.samples[i].push(vectorToMatrix(0+r2,0+r2))
			this.samples[i].push(vectorToMatrix(1,0))
		}
		else {
			this.samples[i].push(vectorToMatrix(1+r2,1+r2))
			this.samples[i].push(vectorToMatrix(1,0))
		}
	}
}
TestingData = function(nb){
	var div = 5
	this.samples = []
	for(var i = 0;i<nb;i++){
		this.samples[i] = []
		var r = Math.random()
		var r2 = (1-2*Math.random())/div
		if(r<0.25){
			this.samples[i].push(vectorToMatrix(0+r2,1+r2))
			this.samples[i].push(vectorToMatrix(0,1))
		}
		else if (r<0.5){
			this.samples[i].push(vectorToMatrix(1+r2,0+r2))
			this.samples[i].push(vectorToMatrix(0,1))
		}
		else if (r<0.75){
			this.samples[i].push(vectorToMatrix(0+r2,0+r2))
			this.samples[i].push(vectorToMatrix(1,0))
		}
		else {
			this.samples[i].push(vectorToMatrix(1+r2,1+r2))
			this.samples[i].push(vectorToMatrix(1,0))
		}
	}
}

function gaussRandom(){
	return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3
}


function Ziggurat(){

  var jsr = 123456789;

  var wn = Array(128);
  var fn = Array(128);
  var kn = Array(128);

  function RNOR(){
    var hz = SHR3();
    var iz = hz & 127;
    return (Math.abs(hz) < kn[iz]) ? hz * wn[iz] : nfix(hz, iz);
  }

  this.nextGaussian = function(){
    return RNOR();
  }

  function nfix(hz, iz){
    var r = 3.442619855899;
    var r1 = 1.0 / r;
    var x;
    var y;
    while(true){
      x = hz * wn[iz];
      if( iz == 0 ){
        x = (-Math.log(UNI()) * r1); 
        y = -Math.log(UNI());
        while( y + y < x * x){
          x = (-Math.log(UNI()) * r1); 
          y = -Math.log(UNI());
        }
        return ( hz > 0 ) ? r+x : -r-x;
      }

      if( fn[iz] + UNI() * (fn[iz-1] - fn[iz]) < Math.exp(-0.5 * x * x) ){
         return x;
      }
      hz = SHR3();
      iz = hz & 127;
 
      if( Math.abs(hz) < kn[iz]){
        return (hz * wn[iz]);
      }
    }
  }

  function SHR3(){
    var jz = jsr;
    var jzr = jsr;
    jzr ^= (jzr << 13);
    jzr ^= (jzr >>> 17);
    jzr ^= (jzr << 5);
    jsr = jzr;
    return (jz+jzr) | 0;
  }

  function UNI(){
    return 0.5 * (1 + SHR3() / -Math.pow(2,31));
  }

  function zigset(){
    // seed generator based on current time
    jsr ^= new Date().getTime();

    var m1 = 2147483648.0;
    var dn = 3.442619855899;
    var tn = dn;
    var vn = 9.91256303526217e-3;
    
    var q = vn / Math.exp(-0.5 * dn * dn);
    kn[0] = Math.floor((dn/q)*m1);
    kn[1] = 0;

    wn[0] = q / m1;
    wn[127] = dn / m1;

    fn[0] = 1.0;
    fn[127] = Math.exp(-0.5 * dn * dn);

    for(var i = 126; i >= 1; i--){
      dn = Math.sqrt(-2.0 * Math.log( vn / dn + Math.exp( -0.5 * dn * dn)));
      kn[i+1] = Math.floor((dn/tn)*m1);
      tn = dn;
      fn[i] = Math.exp(-0.5 * dn * dn);
      wn[i] = dn / m1;
    }
  }
  zigset();
}

function rnd_bmt() {
    var x = 0, y = 0, rds, c;

    // Get two random numbers from -1 to 1.
    // If the radius is zero or greater than 1, throw them out and pick two
    // new ones. Rejection sampling throws away about 20% of the pairs.
    do {
        x = Math.random()*2-1;
        y = Math.random()*2-1;
        rds = x*x + y*y;
    }
    while (rds === 0 || rds > 1) 

    // This magic is the Box-Muller Transform
    c = Math.sqrt(-2*Math.log(rds)/rds);

    // It always creates a pair of numbers. I'll return them in an array. 
    // This function is quite efficient so don't be afraid to throw one away
    // if you don't need both.
    return [x*c, y*c];
}

var dataFileBuffer;  
var labelFileBuffer;
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
        go()
      }
      r.readAsArrayBuffer(f);
    } else { 
        alert("Failed to load file");
    }
}

var pixelValues     = [];

function go(){
  // It would be nice with a checker instead of a hard coded 60000 limit here
  for (var image = 0; image <= 60000; image++) { 
    var pixels = [];

    for (var y = 0; y <= 27; y++) {
        for (var x = 0; x <= 27; x++) {
            pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]/255);
        }
    }
    var output = JSON.stringify(labelFileBuffer[image + 8])
    var o = {input: pixels, output:labelToArray(output)}
    pixelValues.push(o)
 }
 var first = pixelValues.input

 trainNumbers()
}

function labelToArray(l){
  var result = [0,0,0,0,0,0,0,0,0,0]
  result[l] = 1
  return result
}

draw = function(digit, context)
  {
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

