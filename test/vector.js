describe('jerzy.Vector', function() {
	describe("#length()", function() {
		it("should return the correct length", function() {
			var v = new jerzy.Vector([]);
			v.push(1);
			v.push(2);
			assert.equal(2, v.length());
		});
	});
});