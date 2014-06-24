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



