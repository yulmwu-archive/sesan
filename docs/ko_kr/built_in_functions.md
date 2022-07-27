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

경로에 `.tiny`가 포함되어 있지 않으면, 자동으로 `.tiny`가 추가됩니다.

# delete

```swift
let x = 5;

delete("x");

println(x); // 식별자 'x' 이(가) 정의되지 않았습니다.
```

# eval

```swift
eval("5 + 5"); // 10
```

<br>

`allowEval`가 `true`여야만 합니다.

**위험한 기능입니다. 사용 시 주의하세요.**

# js

```swift
js("console.log('foo')");
```

`allowJavaScript`가 `true`여야만 합니다.

**위험한 기능입니다. 사용 시 주의하세요.**

# convert

> [`string()`, `number()`, `boolean()`](./standard_library/util.md#string-number-boolean) 상속

# options

```swift
options(); // hash
```
