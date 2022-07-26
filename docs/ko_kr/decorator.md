```
@<hash>
<function> // func <identifier>(<arguments>) <block expression>;
```

> [`<hash>`](./variable/data_type.md#hash), [`<function>`](./function.md) 상속

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
