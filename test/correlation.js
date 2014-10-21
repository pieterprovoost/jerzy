describe('jerzy.Correlation', function() {
	var g = new jerzy.Vector([8.3, 8.6, 8.8, 10.5, 10.7, 10.8, 11.0, 11.0, 11.1, 11.2, 11.3, 11.4, 11.4, 11.7, 12.0, 12.9, 12.9, 13.3, 13.7, 13.8, 14.0, 14.2, 14.5, 16.0, 16.3, 17.3, 17.5, 17.9, 18.0, 18.0, 20.6]);
	var h = new jerzy.Vector([70, 65, 63, 72, 81, 83, 66, 75, 80, 75, 79, 76, 76, 69, 75, 74, 85, 86, 71, 64, 78, 80, 74, 72, 77, 81, 82, 80, 80, 80, 87]);
	var p = jerzy.Correlation.pearson(g, h);
	describe("#pearson", function() {
		it("should return the correct values", function() {
			assert.closeTo(p.r, 0.5192801, 0000001);
			assert.closeTo(p.df, 29, 1);
			assert.closeTo(p.t, 3.2722, 0.0001);
			assert.closeTo(p.p, 0.002758, 0.000001);
		});
	});
});