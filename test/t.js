describe('jerzy.StudentT', function() {
	var first = new jerzy.Vector([26, 21, 22, 26, 19, 22, 26, 25, 24, 21, 23, 23, 18, 29, 22]);
	var second = new jerzy.Vector([18, 23, 21, 20, 20, 29, 20, 16, 20, 26, 21, 25, 17, 18, 19]);
	var st = jerzy.StudentT.test(first, second);
	describe("#df", function() {
		it("should return the correct degrees of freedom", function() {
			assert.equal(st.df, 28);
		});
	});
	describe("#t", function() {
		it("should return the correct t statistic", function() {
			assert.closeTo(st.t, 1.9109, 0.0001);
		});
	});
	describe("#p", function() {
		it("should return the correct p value", function() {
			assert.closeTo(st.p, 0.0663, 0.0001);
		});
	});
});