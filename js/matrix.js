var z = new Ziggurat();

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
			this.m[j].push(z.nextGaussian())
		}
	}
	return this
}

Matrix.prototype.randomize2 = function(input,output){
	for(var j = 0;j<this.row;j++){
		this.m[j] = []
		for(var i = 0;i<this.column;i++){
			var t = 4*Math.sqrt(6)/Math.sqrt(input+output)
			this.m[j].push(2*t*Math.random()-t)
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

Matrix.prototype.norm = function(){
	var norm = 0;
	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			norm += this.m[j][i] *	this.m[j][i]
		}
	}
	return Math.sqrt(norm);
}

Matrix.prototype.identity = function(m1){
	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			if(i==j)
				result.m[j][i] = 1
			else
				result.m[j][i] = 0
		}
	}
	return result
}

