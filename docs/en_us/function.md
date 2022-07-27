```
<arguments>: <identifier>, <identifier>, ...

func <identifier>(<arguments>) <block expression>;

func(<arguments>) <block expression>;
```

> extends [`<block expression>`](./_base/block_expression.md)

---

```swift
func foo(a, b) {
    return a + b;
}

let bar = func(a, b) {
    return a + b;
};
```
