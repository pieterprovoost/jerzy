describe('jerzy.Regression', function() {
	var w = new jerzy.Vector([0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3, 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8]);
	var l = new jerzy.Vector([1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5, 1.7, 1.5, 1.0, 1.7, 1.9, 1.6, 1.6, 1.5, 1.4, 1.6, 1.6, 1.5, 1.5, 1.4, 1.5, 1.2, 1.3, 1.4, 1.3, 1.5, 1.3, 1.3, 1.3, 1.6, 1.9, 1.4, 1.6, 1.4, 1.5, 1.4, 4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.7, 3.3, 4.6, 3.9, 3.5, 4.2, 4.0, 4.7, 3.6, 4.4, 4.5, 4.1, 4.5, 3.9, 4.8, 4.0, 4.9, 4.7, 4.3, 4.4, 4.8, 5.0, 4.5, 3.5, 3.8, 3.7, 3.9, 5.1, 4.5, 4.5, 4.7, 4.4, 4.1, 4.0, 4.4, 4.6, 4.0, 3.3, 4.2, 4.2, 4.2, 4.3, 3.0, 4.1, 6.0, 5.1, 5.9, 5.6, 5.8, 6.6, 4.5, 6.3, 5.8, 6.1, 5.1, 5.3, 5.5, 5.0, 5.1, 5.3, 5.5, 6.7, 6.9, 5.0, 5.7, 4.9, 6.7, 4.9, 5.7, 6.0, 4.8, 4.9, 5.6, 5.8, 6.1, 6.4, 5.6, 5.1, 5.6, 6.1, 5.6, 5.5, 4.8, 5.4, 5.6, 5.1, 5.1, 5.9, 5.7, 5.2, 5.0, 5.2, 5.4, 5.1]); 
	var lm1 = jerzy.Regression.linear(l, w);
	var y = new jerzy.Vector([2000, 2001, 2002, 2003, 2004]);
	var r = new jerzy.Vector([9.34, 8.50, 7.62, 6.93, 6.60]);
	var lm2 = jerzy.Regression.linear(y, r);
	describe("#slope", function() {
		it("should return the correct slope", function() {
			assert.closeTo(lm1.slope, 0.415755, 0.000001);
			assert.closeTo(lm2.slope, -0.70500, 0.00001);
		});
	});
	describe("#intercept", function() {
		it("should return the correct intercept", function() {
			assert.closeTo(lm1.intercept, -0.363076, 0.000001);
			assert.closeTo(lm2.intercept, 1419.20800, 0.00001);
		});
	});
	describe("#rs", function() {
		it("should return the correct R-squared", function() {
			assert.closeTo(lm1.rs, 0.9271, 0.0001);
			assert.closeTo(lm2.rs, 0.976, 0.001);
		});
	});
	describe("#slope_t", function() {
		it("should return the correct T value for the slope", function() {
			assert.closeTo(lm1.slope_t, 43.387, 0.001);
			assert.closeTo(lm2.slope_t, -11.12, 0.01);
		});
	});
	describe("#intercept_t", function() {
		it("should return the correct T value for the intercept", function() {
			assert.closeTo(lm1.intercept_t, -9.131, 0.001);
			assert.closeTo(lm2.intercept_t, 11.18, 0.01);
		});
	});
	describe("#slope_t", function() {
		it("should return the correct p value for the slope", function() {
			assert.closeTo(lm1.slope_p, 0, 0.000000001);
			assert.closeTo(lm2.slope_p, 0.00156, 0.00001);
		});
	});
	describe("#intercept_t", function() {
		it("should return the correct p value for the intercept", function() {
			assert.closeTo(lm1.intercept_p, 0, 0.000000001);
			assert.closeTo(lm2.intercept_p, 0.00153, 0.00001);
		});
	});
});