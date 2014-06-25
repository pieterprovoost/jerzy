# jerzy

Jerzy is a JavaScript statistics library.

## Usage
#### Node

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

### Regression

```javascript
var y = new jerzy.Vector([2000, 2001, 2002, 2003, 2004]);
var r = new jerzy.Vector([9.34, 8.50, 7.62, 6.93, 6.60]);
var lm = new jerzy.Regression.linear(y, r);
console.log(JSON.stringify(lm, null, 4));
```

Output:

```
{
    "n": 5,
    "x": {
        "elements": [
            2000,
            2001,
            2002,
            2003,
            2004
        ]
    },
    "y": {
        "elements": [
            9.34,
            8.5,
            7.62,
            6.93,
            6.6
        ]
    },
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
