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



