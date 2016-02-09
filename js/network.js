//Network
Network = function(sizes, cost){
	this.numLayers = sizes.length;
	this.sizes = sizes;
	this.biases = []
	this.weights = []
	this.cost = cost
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
		weights.push(new Matrix(t[0],t[1]).randomize().multiplyScalar(1.0/Math.sqrt(t[0])))
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

		var z = m.add(m.multiply(activation,w),b)
		zs.push(z)

		activation = m.clone(z).applyAll(sigmoid)
		activations.push(activation)
	})
	
	//backward pass
	var delta = self.cost.delta(zs[zs.length-1],activations[activations.length-1],y)


	nabla_b[nabla_b.length-1] = delta
	nabla_w[nabla_w.length-1] = m.multiply(m.transpose(activations[activations.length-2]),delta)

	for(var i = 2;i<self.numLayers;i++){
		var z = zs[zs.length-i]
		var sp = m.clone(z).applyAll(sigmoidPrime)

		var delta1 = m.multiply(delta,m.transpose(self.weights[self.weights.length-i+1]))

		delta = m.hadamard(delta1,sp)

		nabla_b[nabla_b.length-i] = delta
		nabla_w[nabla_w.length-i] = m.multiply(m.transpose(activations[activations.length-i-1]),delta)
	}

	return [nabla_b,nabla_w]
}

Network.prototype.updateMiniBatch = function(miniBatch,eta,lambda,n){
	var self = this
	var nabla_b = []
	this.biases.forEach(function(b){
		nabla_b.push(m.clone(b).zero())
	})

	var nabla_w = []
	this.weights.forEach(function(b){
		nabla_w.push(m.clone(b).zero())
	})

	console.log("		Batch gradient descent")	
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

	var resultW = []
	zip(self.weights, nabla_w).forEach(function(w){
		var l2 = (1-eta*lambda/n)
		var newW = m.minus(m.clone(w[0]).multiplyScalar(l2),m.clone(w[1]).multiplyScalar(eta/miniBatch.length))
		resultW.push(newW)
	})
	var resultB = []
	zip(self.biases, nabla_b).forEach(function(b){
		resultB.push(m.minus(b[0],m.clone(b[1]).multiplyScalar(eta/miniBatch.length)))
	})

	self.weights = resultW
	self.biases = resultB
}

Network.prototype.SGD = function(trainingData, epochs, miniBatchSize, eta, lambda, evaluationData,monitorEvaluationCost,monitorEvaluationAccuracy,monitorTrainingCost,monitorTrainingAccuracy){
	var self= this;
	evaluationCost = []
	evaluationAccuracy = []
	trainingCost = []
	trainingAccuracy = []

	if(evaluationData)
		var nData = evaluationData.length;
	var n = trainingData.length


	for(var j = 0;j<epochs;j++){
		trainingData = shuffle(trainingData);

		miniBatches = []
		for(var k = 0;k < n ; k+=miniBatchSize)
			miniBatches.push(trainingData.slice(k,k+miniBatchSize))

		console.log("Updating batches (" + miniBatches.length + ")")
		miniBatches.forEach(function(miniBatch){
			self.updateMiniBatch(miniBatch, eta, lambda, trainingData.length);
		})

		console.log("Epoch " + j +"'s training complete")
		if(monitorTrainingCost){
			cost = self.totalCost(trainingData, lambda)
			trainingCost.push(cost)
			console.log("	Cost on training data: " + cost)
		}
		if(monitorTrainingAccuracy){
			accuracy = self.accuracy(trainingData)
			trainingAccuracy.push(accuracy/n)
			console.log("	Accuracy on training data: " + accuracy/n)
		}
		if(monitorEvaluationCost){
			cost = self.totalCost(evaluationData,lambda)
			evaluationCost.push(cost)
			console.log("	Cost on evaluation data: " + cost)
		}
		if(monitorEvaluationAccuracy){
			accuracy = self.accuracy(evaluationData)
			evaluationAccuracy.push(accuracy/n)
			console.log("	Accuracy on evaluation data: " + accuracy/nData)
		}
		console.log(" ------ ")
		//eta*=0.9
	}

	return [evaluationCost,evaluationAccuracy,trainingCost,trainingAccuracy]
}

Network.prototype.accuracy = function(data){
	var self = this
	
	var sum = 0
    data.forEach(function(d){
    	var feed = self.feedforward(d[0])
    	var i = feed.m[0].indexOf(Math.max.apply(Math, feed.m[0]));
    	var j = d[1].m[0].indexOf(Math.max.apply(Math, d[1].m[0]));

		if(j == i)
			sum+=1
	})
    return sum
}

Network.prototype.totalCost = function(data,lambda){
	var self = this
	cost = 0.0;
	data.forEach(function(d){
		a = self.feedforward(d[0])
		y = d[1]

		cost += self.cost.fn(a,y)/data.length
	})

	var sumNormSq = 0

	self.weights.forEach(function(w){
		var norm = w.norm()
		sumNormSq += norm*norm
	})
	cost += 0.5*(lambda/data.length)*sumNormSq
	return cost
}



CrossEntropyCost = function(){
}

CrossEntropyCost.prototype.fn = function(a,y){
	var result = 0;
	for(var j = 0;j<a.row;j++){
		for(var i = 0;i<a.column;i++){
			var aij = a.m[j][i]
			var yij = y.m[j][i]
			result += -yij*Math.log(aij) - (1-yij)*Math.log(1-aij)
		}
	}
	return result;
}

CrossEntropyCost.prototype.delta = function(z,a,y){
	return m.minus(a,y)
}

QuadraticCost = function(){
}

QuadraticCost.prototype.fn = function(a,y){
	var result = m.minus(a,y)
	var norm = result.norm()
	return 0.5*norm*norm
}

QuadraticCost.prototype.delta = function(z,a,y){
	var cost = m.minus(a, y)
	var sigz = m.clone(z).applyAll(sigmoidPrime)
	return m.hadamard(cost,sigz)
}


