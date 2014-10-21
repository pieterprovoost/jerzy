describe('jerzy.Power', function() {
	describe("#sampleSize", function() {
		it("should return the correct sample size", function() {
			assert.closeTo(jerzy.Power.sampleSize(0.05, 0.8, 0.72, 0.15), 362, 1);
		});
	});
});