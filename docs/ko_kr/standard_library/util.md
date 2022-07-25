# length

```swift
length([1, 2, 3]); // 3
```

# match

```swift
println(match(3, [
    [ 1, func(v) { return value + 1; } ],
    [ 2, func(v) { return value + 2; } ]
], func(v) {
    println('없음');
    return v * 10;
}));
```

# string, number, boolean

```swift
string(5); // "5"
number("5"); // 5
boolean(0); // false
```

# ternary

```swift
ternary(true, "foo", "bar"); // "foo"
ternary(false, "foo", "bar"); // "bar"
```
