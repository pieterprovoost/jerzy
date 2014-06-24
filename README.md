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
