// gaussian distributed random generator
var z = new Ziggurat();


//Matrix definition. Only 2D
Matrix = function(column,row){
	var m = []
	this.column = column;
	this.row= row;

	for(var j = 0;j<row;j++){
		m[j] = new Array(i)
		for(var i = 0;i<column;i++){
			m[j][i] = 0
		}
	}
	this.m = m
}

//Randomizes a matrix with normal distribution (mean 0, standard deviation 1 )
Matrix.prototype.randomize = function(){
	for(var j = 0;j<this.row;j++){
		this.m[j] = new Array(i)
		for(var i = 0;i<this.column;i++){
			this.m[j][i] = z.nextGaussian()
		}
	}
	return this
}

//Apply a function on all matrix elements
Matrix.prototype.applyAll = function(func){
	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			this.m[j][i] = func(this.m[j][i])	
		}
	}
	return this;
}

//returns the sum of two matrix
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

//returns the hadamrd product of two matrix
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

//returns the difference of two matrix
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

//returns the dot product of two matrix
Matrix.prototype.multiply = function(m1,m2){
	if(m1.column != m2.row){
		console.log("cant multiply matrices if colums m1 != rows m2")
	}
	var result = new Matrix(m2.column,m1.row)
	for(var j = 0;j<result.row;j++)
		for(var k = 0;k<m1.column;k++)
			for(var i = 0;i<result.column;i++)
				result.m[j][i] += m1.m[j][k] * m2.m[k][i];
	return result
}

//returns the copy of a matrix
Matrix.prototype.clone = function(m1){
	var result = new Matrix(m1.column, m1.row)

	for(var j = 0;j<m1.row;j++){
		for(var i = 0;i<m1.column;i++){
			result.m[j][i] = m1.m[j][i]
		}
	}
	return result
}

//returns a zeroed out copy of a matrix
Matrix.prototype.zero = function(){
	var result = new Matrix(this.column, this.row)

	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			result.m[j][i] = 0
		}
	}
	return result
}

//draw te matrix in the console
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

//returns the transposed matrix
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

//Multiply all matrix elements by a scalar
Matrix.prototype.multiplyScalar = function(x){
	return this.applyAll(function(y){return y*x})
}

//returns the norm of the matrix
Matrix.prototype.norm = function(){
	var norm = 0;
	for(var j = 0;j<this.row;j++){
		for(var i = 0;i<this.column;i++){
			norm += this.m[j][i] *	this.m[j][i]
		}
	}
	return Math.sqrt(norm);
}

//returns an identity matrix of the same shape as the argument matrix
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

var m = new Matrix();

