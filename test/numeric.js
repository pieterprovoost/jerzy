describe('jerzy.Numeric', function() {
	describe("#bisection", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Numeric.bisection(Math.sin, 3, 4), Math.PI, 0.000000001);
		});
	});
	describe("#secant", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Numeric.secant(Math.sin, 3, 4), Math.PI, 0.000000001);
		});
	});
});