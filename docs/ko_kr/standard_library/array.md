```swift
let arr = [1, 2, 3];
```

# push

```swift
push(array, 4); // [1, 2, 3, 4]
```

# pop

```swift
pop(array); // [1, 2]
```

# shift

```swift
shift(array); // [2, 3]
```

# unshift

```swift
unshift(array, 0); // [0, 1, 2, 3]
```

# slice

```swift
slice(array, 1, 3); // [2, 3]
```

# join

```swift
join(array, ", "); // "1, 2, 3"
```

# forEach

```swift
forEach(array, func(value, index) {
    println(index, value);
});
```

# repeat

```swift
repeat(5); // [NULL, NULL, NULL, NULL, NULL]

repeat("foo", 3); // ["foo", "foo", "foo"]
```
