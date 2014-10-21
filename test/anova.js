describe('jerzy.Anova', function() {
	var folate = new jerzy.Vector([243, 251, 275, 291, 347, 354, 380, 392, 206, 210, 226, 249, 255, 273, 285, 295, 309, 241, 258, 270, 293, 328]);
	var ventilation = new jerzy.Factor(["N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,op", "N2O+O2,op",  "N2O+O2,op",  "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "O2,24h", "O2,24h", "O2,24h", "O2,24h", "O2,24h"]);
	var a = Anova.oneway(ventilation, folate);
	describe("#tdf", function() {
		it("should return the correct value", function() {
			assert.equal(a.tdf, 2);
		});
	});
	describe("#tss", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.tss, 15516, 1);
		});
	});
	describe("#tms", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.tms, 7757.9, 0.1);
		});
	});
	describe("#edf", function() {
		it("should return the correct value", function() {
			assert.equal(a.edf, 19);
		});
	});
	describe("#ess", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.ess, 39716, 1);
		});
	});
	describe("#ems", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.ems, 2090.3, 0.1);
		});
	});
	describe("#f", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.f, 3.7113, 0.0001);
		});
	});
	describe("#p", function() {
		it("should return the correct value", function() {
			assert.closeTo(a.p, 0.04359, 0.00001);
		});
	});
});