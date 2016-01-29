LearningData = function(nb){
	var div = 10
	this.samples = []


	for(var i = 0;i<nb;i++){
		this.samples[i] = []
		var r = Math.random()
		if(r<0.25){
			this.samples[i].push(vectorToMatrix(0+(1-2*Math.random())/div,1+(1-2*Math.random())/div))
			this.samples[i].push(vectorToMatrix(1,0))
		}
		else if (r<0.5){
			this.samples[i].push(vectorToMatrix(1+(1-2*Math.random())/div,0+(1-2*Math.random())/div))
			this.samples[i].push(vectorToMatrix(1,0))
		}
		else if (r<0.75){
			this.samples[i].push(vectorToMatrix(0+(1-2*Math.random())/div,0+(1-2*Math.random())/div))
			this.samples[i].push(vectorToMatrix(1,0))
		}
		else {
			this.samples[i].push(vectorToMatrix(1+(1-2*Math.random())/div,1+(1-2*Math.random())/div))
		this.samples[i].push(vectorToMatrix(0,1))
		}
	}
}

TestingData = function(){
	var div = 5
	this.samples = []
	for(var i = 0;i<100;i++){
		this.samples[i] = []
		this.samples[i].push(vectorToMatrix(0+(1-2*Math.random())/div,1+(1-2*Math.random())/div))
		this.samples[i].push(vectorToMatrix(1,0))
	}

	for(var i = 100;i<200;i++){
		this.samples[i] = []
		this.samples[i].push(vectorToMatrix(1+(1-2*Math.random())/div,0+(1-2*Math.random())/div))
		this.samples[i].push(vectorToMatrix(1,0))
	}
	
	for(var i = 200;i<300;i++){
		this.samples[i] = []
		this.samples[i].push(vectorToMatrix(0+(1-2*Math.random())/div,0+(1-2*Math.random())/div))
		this.samples[i].push(vectorToMatrix(1,0))
	}
	for(var i = 300;i<400;i++){
		this.samples[i] = []
		this.samples[i].push(vectorToMatrix(1+(1-2*Math.random())/div,1+(1-2*Math.random())/div))
		this.samples[i].push(vectorToMatrix(0,1))
	}
}


//Network
Network = function(sizes){
	this.numLayers = sizes.length;
	this.sizes = sizes;
	this.biases = []
	this.weights = []
}

Network.prototype.init= function(){
	var biases = [];
	var weights = [];

	var noFirst = this.sizes.slice(1,this.sizes.length);

	noFirst.forEach(function(y){
		biases.push(new Matrix(y,1).randomize())
	})

	this.biases = biases

	var noLast = this.sizes.slice(0,this.sizes.length-1);
	var z = zip(noFirst,noLast)
	z.forEach(function(t){
		weights.push(new Matrix(t[0],t[1]).randomize())
	})

	this.weights = weights
}

Network.prototype.feedforward = function(a){
	zip(this.biases,this.weights).forEach(function(t){
		var b = t[0]
		var w = t[1]
		
		a = m.add(m.multiply(a,w),b).applyAll(sigmoid)
	})
	return a
}

Network.prototype.backprop = function(x,y){
	var self = this
	nabla_b = []
	this.biases.forEach(function(b){
		nabla_b.push(m.clone(b).zero())
	})

	nabla_w = []
	this.weights.forEach(function(b){
		nabla_w.push(m.clone(b).zero())
	})

	activation = x;
	activations = [x]

	var zs = [];

	//feedforward
	zip(self.biases, self.weights).forEach(function(z){
		b = z[0]
		w = z[1]

		z = m.add(m.multiply(activation,w),b)
		zs.push(z)

		activation = m.clone(z).applyAll(sigmoid)
		activations.push(activation)
	})
	

	var cost = self.costDerivative(activations[activations.length-1], y)
	var sigz = m.clone(zs[zs.length-1]).applyAll(sigmoidPrime)
	var delta =   m.hadamard(cost,sigz)

	nabla_b[nabla_b.length-1] = delta
	nabla_w[nabla_w.length-1] = m.multiply(m.transpose(activations[activations.length-2]),delta)

	for(var i = 2;i<self.numLayers;i++){
		z = zs[zs.length-1]

		sp = m.clone(z).applyAll(sigmoidPrime)

		delta = m.multiply(delta,m.transpose(self.weights[self.weights.length-i+1])).multiplyScalar(sp.m[0][0])

		nabla_b[nabla_b.length-i] = delta
		nabla_w[nabla_w.length-i] = m.multiply(m.transpose(activations[activations.length-i-1]),delta)
	}

	return [nabla_b,nabla_w]
}

Network.prototype.costDerivative = function(outputActivation,y){
	return m.minus(outputActivation , y)
}

Network.prototype.update = function(miniBatch,eta){
	var self = this
	var nabla_b = []
	this.biases.forEach(function(b){
		nabla_b.push(m.clone(b).zero())
	})

	var nabla_w = []
	this.weights.forEach(function(b){
		nabla_w.push(m.clone(b).zero())
	})

	miniBatch.forEach(function(d){
		var x = d[0]
		var y = d[1]

		var backprop = self.backprop(x,y)
		var delta_nabla_b = backprop[0]
		var delta_nabla_w = backprop[1]

		zip(nabla_b,delta_nabla_b).forEach(function(b,i){
			nabla_b[i] = m.add(b[0],b[1])
		})

		zip(nabla_w,delta_nabla_w).forEach(function(w,i){
			nabla_w[i] = m.add(w[0],w[1])
		})
	})


	//console.log(" expected result")
	//console.log(miniBatch[0][1].m[0])

	//console.log("before ")
	var feed = self.feedforward(miniBatch[0][0]).m[0]
	//console.log(feed)

	var resultW = []
	zip(self.weights, nabla_w).forEach(function(w){
		resultW.push(m.minus(w[0],w[1].multiplyScalar(eta/miniBatch.length)))
	})
	var resultB = []
	zip(self.biases, nabla_b).forEach(function(b){
		resultB.push(m.minus(b[0],b[1].multiplyScalar(eta/miniBatch.length)))
	})

	self.weights = resultW
	self.biases = resultB

	//console.log("after ")
	//console.log(self.feedforward(miniBatch[0][0]).m[0])
	//console.log("---")
}

Network.prototype.SGD = function(trainingData, epochs, miniBatchSize, eta, testData){
	var max = 0
	var self= this;
	if(testData)
		var nTest = trainingData.length;

	var n = trainingData.length

	for(var j = 0;j<epochs;j++){
		trainingData = shuffle(trainingData);

		miniBatches = []
		for(var k = 0;k < n ; k+=miniBatchSize)
			miniBatches.push(trainingData.slice(k,k+miniBatchSize))

		miniBatches.forEach(function(miniBatch){
			self.update(miniBatch, eta);
		})

		if(testData){
			console.log("Epoch : " + j)
			var evaluate = this.evaluate(trainingData)
			console.log("   accuracy : " + evaluate/nTest*100 + "%")

			if(evaluate>max)
				max = evaluate
		}

		else
			console.log("Epoch : " + j + " complete")

	}
	if(testData)
		console.log("Best : " + max/nTest*100 )
}

Network.prototype.evaluate = function(testData){

	var self = this

	var sum = 0
    testData.forEach(function(d){
    	var feed = self.feedforward(d[0])
    	var i = feed.m[0].indexOf(Math.max.apply(Math, feed.m[0]));
    	var j = d[1].m[0].indexOf(Math.max.apply(Math, d[1].m[0]));

		if(j == i)
			sum+=1
	})

    return sum
}





//Matrix
Matrix = function(column,row){
	var m = []
	this.column = column;
	this.row= row;

	for(var j = 0;j<row;j++){
		m[j] = []
		for(var i = 0;i<column;i++){
			m[j].push(0)
		}
	}
	this.m = m
}

Matrix.prototype.randomize = function(){
	for(var j = 0;j<this.row;j++){
		this.m[j] = []
		for(var i = 0;i<this.column;i++){
			//this.m[j].push(j*this.column+i+1)
			this.m[j].push(1-2*Math.random())
		}
	}
	return this
}

Matrix.prototype.applyAll = function(func){
	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			this.m[j][i] = func(this.m[j][i])	
		}
	}
	return this;
}

Matrix.prototype.add = function(m1,m2){
	if(m1.column != m2.column || m1.row!=m2.row){
		console.log("cant add matrixes of different dimensions")
		return -1
	}

	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			result.m[j][i] = m1.m[j][i] + m2.m[j][i]	
		}
	}
	return result
}

Matrix.prototype.hadamard = function(m1,m2){
	if(m1.column != m2.column || m1.row!=m2.row){
		console.log("cant add matrixes of different dimensions")
		return -1
	}

	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			result.m[j][i] = m1.m[j][i] * m2.m[j][i]	
		}
	}
	return result
}

Matrix.prototype.minus = function(m1,m2){
	if(m1.column != m2.column || m1.row!=m2.row){
		console.log("cant add matrixes of different dimensions")
		return -1
	}

	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			result.m[j][i] = m1.m[j][i] - m2.m[j][i]	
		}
	}
	return result
}

Matrix.prototype.multiply = function(m1,m2){
	if(m1.column != m2.row){
		console.log("cant multiply matrices if colums m1 != rows m2")
	}
	var result = new Matrix(m2.column,m1.row)
	for(var j = 0;j<result.row;j++){
		for(var i = 0;i<result.column;i++){
			sum = 0
			for(var k = 0;k<m1.column;k++)
				sum += m1.m[j][k] * m2.m[k][i];
			result.m[j][i] = sum
		}
	}
	return result
}

Matrix.prototype.clone = function(m1){
	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			result.m[j][i] = m1.m[j][i]
		}
	}
	return result
}

Matrix.prototype.zero = function(){
	var result = new Matrix(this.column, this.row)

	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			result.m[j][i] = 0
		}
	}
	return result
}

Matrix.prototype.draw = function(){
	var line = "" 
	for(var j = 0;j<this.row;j++){
		line = ""
		for(var i = 0;i<this.column;i++){
			line+= this.m[j][i].toString()
			line+=" "
		}
		console.log(line)	
	}
	console.log("---")
}

Matrix.prototype.transpose = function(m1){


	var result = new Matrix(m1.row,m1.column)
	var newArray = m1.m[0].map(function(col, i) { 
  		return m1.m.map(function(row) { 
		    return row[i] 
		  })
		});
	result.m = newArray
	return result
}

Matrix.prototype.multiplyScalar = function(x){
	return this.applyAll(function(y){return y*x})
}

function vectorToMatrix(x,y){
	var m = new Matrix(2,1)
	m.m[0][0] = x;
	m.m[0][1] = y;
	return m
}

// 
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



var m = new Matrix()
var n = new Network([2,20,2])
n.init()

var data = new LearningData(500)
console.log(data)
console.log(n)

console.log("Training network")
n.SGD(data.samples,30,20,3,true)


var ldata = new TestingData()
console.log(ldata)
console.log("Testing network")
var eval = n.evaluate(ldata.samples)
var nTest = ldata.samples.length
console.log("accuracy: " + eval/nTest*100+ "%")




