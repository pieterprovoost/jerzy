describe('jerzy.Confidence', function() {
	var v = new jerzy.Vector([44617, 7066, 17594, 2726, 1178, 18898, 5033, 37151, 4514, 4000]);
	var v2 = new jerzy.Vector([19.9, 29.6, 18.7, 24.2]);
	describe("#confidence", function() {
		it("should return the correct confidence interval", function() {
			assert.closeTo(jerzy.Confidence.normal(v, 0.95)[0], 3299.868, 0.001);
			assert.closeTo(jerzy.Confidence.normal(v, 0.95)[1], 25255.532, 0.001);
			assert.closeTo(jerzy.Confidence.normalLower(v2, 0.95), 17.30, 0.01);
			assert.closeTo(jerzy.Confidence.normalUpper(v, 0.95), 23173.46, 0.01);
		});
	});
});
