describe('jerzy.Misc', function() {
	describe("#pochhammer", function() {
		it("should return the correct value", function() {
			assert.closeTo(jerzy.Misc.pochhammer(5, 3), 210, 1);
		});
	});
});