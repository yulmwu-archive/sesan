```
@<hash>
<function> // func <identifier>(<arguments>) <block expression>;
```

> extends [`<hash>`](./variable/data_type.md#hash), [`<function>`](./function.md)

---

```swift
let myHash = {
    foo: 'bar',
};

@myHash
func myFunc() {
    println(this <- decorator <- foo);
}

myFunc();
```
