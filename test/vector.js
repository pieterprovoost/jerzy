describe('jerzy.Vector', function() {
	describe("#length()", function() {
		it("should return the correct length", function() {
			var v = new jerzy.Vector([]);
			v.push(1);
			v.push(2);
			assert.equal(2, v.length());
		});
	});
	describe("#skewness()", function() {
		it("should return the correct skewness", function() {
			var v = new jerzy.Vector([-6, 2, 15, -6, 10, 7, 3, 8, 11, -2]);
			assert.closeTo(v.skewness(), -0.1627, 0.0001);
		});
	});
	describe("#kurtosis()", function() {
		it("should return the correct kurtosis", function() {
			var v = new jerzy.Vector([-6, 2, 15, -6, 10, 7, 3, 8, 11, -2]);
			assert.closeTo(v.kurtosis(), 1.8118, 0.0001);
		});
	});
	describe("#geomean()", function() {
		it("should return the correct geometric mean", function() {
			var v = new jerzy.Vector([1, 2, 3, 10]);
			assert.closeTo(v.geomean(), 2.783158, 0.000001);
		});
	});
	describe("#median()", function() {
		it("should return the correct median", function() {
			var v = new jerzy.Vector([1, 5, 3, 2]);
			assert.equal(v.median(), 2.5);
			v = new jerzy.Vector([1, 5, 3, 2, 4]);
			assert.equal(v.median(), 3);
			v = new jerzy.Vector([1, 2]);
			assert.equal(v.median(), 1.5);
		});
	});
	describe("#q1()", function() {
		it("should return the correct q1", function() {
			var v = new jerzy.Vector([1, 5, 3, 2]);
			assert.equal(v.q1(), 1.5);
			v = new jerzy.Vector([1, 5, 3, 2, 4]);
			assert.equal(v.q1(), 1.5);
		});
	});
	describe("#q3()", function() {
		it("should return the correct q2", function() {
			var v = new jerzy.Vector([1, 5, 3, 2]);
			assert.equal(v.q3(), 4);
			v = new jerzy.Vector([1, 5, 3, 2, 4]);
			assert.equal(v.q3(), 4.5);
		});
	});
});