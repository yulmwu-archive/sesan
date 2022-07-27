```
<arguments>: <identifier>, <identifier>, ...

func <identifier>(<arguments>) <block expression>;

func(<arguments>) <block expression>;
```

> [`<block expression>`](./_base/block_expression.md) 상속

---

```swift
func foo(a, b) {
    return a + b;
}

let bar = func(a, b) {
    return a + b;
};
```
