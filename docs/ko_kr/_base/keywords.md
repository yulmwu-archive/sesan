```
<let>, <func>, <true>, <false>, <if>, <else>, <return>, <while>, <in>, <typeof>, <null>, <throw>, <delete>
```

> [`<let>`](../variable/README.md), [`<func>`](../function.md), [`<true>`](../variable/data_type.md#boolean), [`<false>`](../variable/data_type.md#boolean), [`<if>`](../control_flow/if.md), [`<else>`](../control_flow/if.md), [`<return>`](./return.md), [`<while>`](../control_flow/while.md), [`<in>`](../operator.md) 상속

---

# typeof

```
<typeof> <expr>
```

<br>

```js
typeof 10; // NUMBER
typeof 'foo'; // STRING
typeof true; // BOOLEAN
typeof {}; // HASH
typeof []; // ARRAY
typeof null; // NULL
typeof func() {}; // FUNCTION
```

# null

```swift
null; // NULL
```

# throw

```
<throw> <expr>
```

<br>

```swift
throw 'Error'; // Error
```

# delete

```
<delete> <expr>
```

<br>

```js
let a = 10;

delete a;

a; // 식별자 'a' 이(가) 정의되지 않았습니다.
```
