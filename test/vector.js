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
});