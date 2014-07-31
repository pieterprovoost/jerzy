describe('jerzy.Confidence', function() {
	var v = new jerzy.Vector([44617, 7066, 17594, 2726, 1178, 18898, 5033, 37151, 4514, 4000]);
	describe("#confidence", function() {
		it("should return the correct confidence interval", function() {
			assert.closeTo(jerzy.Confidence.confidence(v, 0.95)[0], 3299.868, 0.001);
			assert.closeTo(jerzy.Confidence.confidence(v, 0.95)[1], 25255.532, 0.001);
		});
	});
});