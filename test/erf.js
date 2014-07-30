describe('jerzy.Misc', function() {
	describe("#erf", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Misc.erf(0.001), 0.001128379, 0.000000001);
			assert.closeTo(jerzy.Misc.erf(0.1), 0.112462916, 0.000000001);
			assert.closeTo(jerzy.Misc.erf(0.5), 0.520499878, 0.000000001);
			assert.closeTo(jerzy.Misc.erf(1), 0.842700793, 0.000000001);
			assert.closeTo(jerzy.Misc.erf(3), 0.999977910, 0.000000001);
			assert.closeTo(jerzy.Misc.erf(-3), -0.999977910, 0.000000001);
		});
	});
});