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
