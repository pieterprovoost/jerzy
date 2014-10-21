describe('jerzy.Misc', function() {
	describe("#beta", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Misc.beta(1, 1), 1, 0.00001);
			assert.closeTo(jerzy.Misc.beta(2, 2), 0.1666667, 0.0000001);
			assert.closeTo(jerzy.Misc.beta(2, 3), 0.08333333, 0.00000001);
			assert.closeTo(jerzy.Misc.beta(10, 10), 0.000001082509, 0.000000000001);
		});
	});
});

describe('jerzy.Misc', function() {
	describe("#ibeta", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Misc.ibeta(0.01, 2, 2), 0.00004966667, 0.00000001);
			assert.closeTo(jerzy.Misc.ibeta(0.1, 2, 2), 0.004667, 0.000001);
			assert.closeTo(jerzy.Misc.ibeta(0.2, 2, 2), 0.017333, 0.000001);
			assert.closeTo(jerzy.Misc.ibeta(0.9, 2, 2), 0.162, 0.001);
		});
	});
});


describe('jerzy.Misc', function() {
	describe("#rbeta", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Misc.rbeta(0.01, 2, 2), 0.000298, 0.000001);
			assert.closeTo(jerzy.Misc.rbeta(0.1, 2, 2), 0.028, 0.001);
			assert.closeTo(jerzy.Misc.rbeta(0.2, 2, 2), 0.104, 0.001);
			assert.closeTo(jerzy.Misc.rbeta(0.9, 2, 2), 0.972, 0.001);
		});
	});
});