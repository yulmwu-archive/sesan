# import

```swift
// file.tiny

let x = 5;
```

<br>

```swift
import("file");

println(x);
```

<br>

If `.tiny` is not included in path, `.tiny` will be added automatically.

# typeof

```swift
typeof(5); // NUMBER
typeof(true); // BOOLEAN
typeof("foo"); // STRING

// ...
```

# throw

```swift
throw("error");
```

# delete

```swift
let x = 5;

delete("x");

println(x); // Identifier 'x' is not defined.
```

# eval

```swift
eval("5 + 5"); // 10
```

<br>

`allowEval` must be `true`.

**This feature is a dangerous feature. be careful.**

# js

```swift
js("console.log('foo')");
```

`allowJavaScript` must be `true`.

**This feature is a dangerous feature. be careful.**

# convert

> extends [`string()`, `number()`, `boolean()`](./standard_library/util.md#string-number-boolean)

# options

```swift
options(); // hash
```

# null

```swift
null(); // NULL
```
