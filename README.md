# jerzy

Jerzy is a JavaScript statistics library

## Usage
#### Node.js

```javascript
var jerzy = require("./jerzy");
console.log(new jerzy.Normal(0, 1).dens(0));
```

#### Browser

```html
<script src="browser.js"></script>
<script>
  console.log(new Normal(0, 1).dens(0));
</script>
```

## Features
### Distributions
#### Normal distribution

```javascript
var v = new jerzy.Vector([0, 1, 2, 3]);
var d = new jerzy.Normal(0, 1).dens(v);
console.log(JSON.stringify(d, null, 4));
```

Output:

```
{
    "elements": [
        0.3989422804014327,
        0.24197072451914337,
        0.05399096651318806,
        0.0044318484119380075
    ]
}
```

#### T distribution

```javascript
var v = new jerzy.Vector([-5, -4, -3]);
var d = new jerzy.T(100).distr(v);
console.log(JSON.stringify(d, null, 4));
```

Output:

```
{
    "elements": [
        0.0000012250869359284488,
        0.00006076182218810418,
        0.001703957671686302
    ]
}
```

### Hypothesis testing
#### Two-sample Student's T-test

```javascript
var first = new jerzy.Vector([26, 21, 22, 26, 19, 22, 26, 25, 24, 21, 23, 23, 18, 29, 22]);
var second = new jerzy.Vector([18, 23, 21, 20, 20, 29, 20, 16, 20, 26, 21, 25, 17, 18, 19]);
var t = jerzy.StudentT.test(first, second);
console.log(JSON.stringify(t, null, 4));
```

Output:

```
{
    "se": 1.1861636172906869,
    "t": 1.910922433992667,
    "df": 28,
    "p": 0.06630238610019434
}
```

### Regression
#### Simple linear regression

```javascript
var y = new jerzy.Vector([2000, 2001, 2002, 2003, 2004]);
var r = new jerzy.Vector([9.34, 8.50, 7.62, 6.93, 6.60]);
var lm = jerzy.Regression.linear(y, r);
console.log(JSON.stringify(lm, null, 4));
```

Output:

```
{
    "n": 5,
    "slope": -0.7050000000000001,
    "intercept": 1419.208,
    "rse": 0.2005243127403941,
    "slope_se": 0.06341135544995657,
    "slope_t": -11.117882514849835,
    "slope_p": 0.00155918701775426,
    "intercept_se": 126.94956528481282,
    "intercept_t": 11.17930570944446,
    "intercept_p": 0.0015341064002789562,
    "rs": 0.9763046860267774
}
```

### ANOVA
#### One-way ANOVA

```javascript
var folate = new jerzy.Vector([243, 251, 275, 291, 347, 354, 380, 392, 206, 210, 226, 249, 255, 273, 285, 295, 309, 241, 258, 270, 293, 328]);
var ventilation = new jerzy.Factor(["N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,24h", "N2O+O2,op", "N2O+O2,op",  "N2O+O2,op",  "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "N2O+O2,op", "O2,24h", "O2,24h", "O2,24h", "O2,24h", "O2,24h"]);
console.log(JSON.stringify(Anova.oneway(ventilation, folate), null, 4));
```

Output:

```
{
    "tdf": 2,
    "tss": 15515.766414141408,
    "tms": 7757.883207070704,
    "edf": 19,
    "ess": 39716.09722222222,
    "ems": 2090.3209064327484,
    "f": 3.7113359882669754,
    "p": 0.04358933495917705
}
```

### Correlation

```javascript
var g = new jerzy.Vector([8.3, 8.6, 8.8, 10.5, 10.7, 10.8, 11.0, 11.0, 11.1, 11.2, 11.3, 11.4, 11.4, 11.7, 12.0, 12.9, 12.9, 13.3, 13.7, 13.8, 14.0, 14.2, 14.5, 16.0, 16.3, 17.3, 17.5, 17.9, 18.0, 18.0, 20.6]);
var h = new jerzy.Vector([70, 65, 63, 72, 81, 83, 66, 75, 80, 75, 79, 76, 76, 69, 75, 74, 85, 86, 71, 64, 78, 80, 74, 72, 77, 81, 82, 80, 80, 80, 87]);
console.log(JSON.stringify(jerzy.Correlation.pearson(g, h), null, 4));
```

Output:

```
{
    "r": 0.5192800719499371,
    "t": 3.27216859079223,
    "df": 29,
    "p": 0.002757814793822755
}
```

### Numerical analysis
#### Adaptive Simpson

```javascript
var area = jerzy.Numeric.adaptiveSimpson(function(x) {
	return Math.pow(x, x)
}, 0, 1, 0.000000000001, 20);
console.log(area);
```

Output:

```
0.7834305107121379
```

#### Root finding (secant method)

```javascript
console.log(jerzy.Numeric.secant(Math.sin, 3, 4));
```

Output:

```
3.1415926535897647
```

#### Root finding (bisection method)

```javascript
console.log(jerzy.Numeric.bisection(Math.sin, 3, 4));
```

Output:

```
3.1415926539339125
```

### Special functions
#### Beta function

```javascript
console.log(jerzy.Misc.beta(2, 2));
console.log(jerzy.Misc.ibeta(0.2, 2, 2));
console.log(jerzy.Misc.rbeta(0.2, 2, 2));
```

Output:

```
0.16666666666666655
0.017333333333333333
0.10400000000000006
```

#### Gamma function

```javascript
var gamma = jerzy.Misc.gamma(0.5);
console.log(gamma);
```

Output:

```
1.7724538509055159
```

