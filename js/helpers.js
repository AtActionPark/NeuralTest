//helpers

//Transforms an array to the used matrix format
function arrayToMatrix(arr){
	var m = new Matrix(arr.length,1)
	//arr.forEach(function(a,i){
	//	m.m[0][i] = a
	//})
  m.m[0] = arr
	return m
}


function sigmoid(x){
	return 1.0/(1+Math.exp(-x))
}

function sigmoidPrime(x){
	return sigmoid(x)*(1-sigmoid(x))
}

function tanh(x){
  return 2*sigmoid(2*x)-1;
}

function tanhPrime(x){
  return 1 - tanh(x)*tanh(x);
}

function relu(x){
  return Math.max(0,x);
}

function reluPrime(x){
  if(x>0)
    return 1;
  return 0
}

//Returns a list for iteration on two parameters
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

//Ziggurat algo for generating random numbers following a gaussian distribution
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

//Transform the sample result (1,2,3 ...) into a 10 sized array
function labelToArray(l){
  var result = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
  result[l] = 1
  return result
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

function NaNToNum(x){
  if (isNaN(x))
    return 0;
  return x
}











