Factor = function(elements) {
	this.levels = [];
	this.factors = [];
	for (var i = 0; i < elements.length; i++) {
		if ((index = this.levels.indexOf(elements[i])) != -1) {
			this.factors.push(index);
		} else {
			this.factors.push(this.levels.length);
			this.levels.push(elements[i]);
		}
	}
};

Factor.prototype.group = function(g) {
	var indices = [];
	var i = -1;
	while ((i = this.factors.indexOf(g, i + 1)) != -1) {
		indices.push(i);
	}
	return indices;
};

Factor.prototype.length = function() {
	return this.factors.length;
};

Factor.prototype.groups = function() {
	return this.levels.length;
};

module.exports.Factor = Factor;