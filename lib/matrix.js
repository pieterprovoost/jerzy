Matrix = function(elements) {
	this.elements = elements;
};

Matrix.prototype.rows = function() {
	return this.elements.length;
};

Matrix.prototype.cols = function() {
	return this.elements[0].length;
};

Matrix.prototype.dot = function(m) {
	var result = [];
	for (var i = 0; i < this.rows(); i++) {
		result[i] = [];
		for (var j = 0; j < m.cols(); j++) {
			var sum = 0;
			for (var k = 0; k < this.cols(); k++) {
				sum += this.elements[i][k] * m.elements[k][j];
			}
			result[i][j] = sum;
		}
	}
	return new Matrix(result); 
};

module.exports.Matrix = Matrix;