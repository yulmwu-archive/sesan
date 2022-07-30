[English](./README.md) | [한국어](./README_KR.md)

[Docs](./README.md#documentation) | [문서](#문서)

---

-   [**소개**](#소개)
    -   [작동 원리](#작동-원리)
    -   [REPL](#REPL)
        -   [REPL 명령어](#REPL-명령어)
    -   [웹 Playground](#웹-Playground)
-   [**인터프리터**](#인터프리터)
    -   토크나이저 (Tokenizer)
        -   [토큰 (Token)](#토큰-token)
    -   파서 (Parser)
        -   [식 (Expression)](#식-expression)
        -   [구문 (Statement)](#구문-statement)
        -   [우선순위 (Priority)](#우선순위-priority)
        -   [연산자 (Operator)](#연산자-operator)
-   [**내장 함수 (Built-in Functions)**](#내장-함수-built-in-functions)
-   [**표준 라이브러리**](#표준-라이브러리)
-   [**옵션**](#옵션)
-   [**Npm 패키지**](#Npm-패키지)
-   [**예제**](#예제)

<br>

# 소개

## 작동 원리

```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator -> [Repl]
```

<br>

## REPL

```sh
# 의존성 설치
npm i

# REPL
npm run start:repl

# 아래의 명령줄로 파일을 실행할 수 있습니다.
npm run start:repl [file]
```

<br>

## REPL 명령어

`//명령어 ...매개 변수`

| 명령어 | 설명                                              |
| ------ | ------------------------------------------------- |
| `exit` | REPL 종료                                         |
| `mode` | REPL 모드 변경 (`repl`, `lexer`, `parser`, `env`) |

<br>

# 웹 Playground

[여기](https://tsukiroku.github.io/tiny)를 클릭하여 웹 Playground을 실행할 수 있습니다.

<br>

# 인터프리터

## 토큰 (Token)

| 토큰        | 식별자     | 토큰           | 식별자    |
| ----------- | ---------- | -------------- | --------- |
| `EOF`       | `EOF`      | `ILLEGAL`      | `ILLEGAL` |
| `NUMBER`    | `NUMBER`   | `IDENT`        | `IDENT`   |
| `TRUE`      | `TRUE`     | `STRING`       | `STRING`  |
| `FUNCTION`  | `FUNCTION` | `FALSE`        | `FALSE`   |
| `ASSIGN`    | `=`        | `COMMENT`      | `COMMENT` |
| `MINUS`     | `-`        | `PLUS`         | `+`       |
| `ASTERISK`  | `*`        | `BANG`         | `!`       |
| `PERCENT`   | `%`        | `SLASH`        | `/`       |
| `GT`        | `>`        | `LT`           | `<`       |
| `NOT_EQUAL` | `!=`       | `EQUAL`        | `==`      |
| `COLON`     | `:`        | `COMMA`        | `,`       |
| `LPAREN`    | `(`        | `SEMICOLON`    | `;`       |
| `LBRACE`    | `{`        | `RPAREN`       | `)`       |
| `LBRACKET`  | `[`        | `RBRACE`       | `}`       |
| `LET`       | `LET`      | `RBRACKET`     | `]`       |
| `ELSE`      | `ELSE`     | `IF`           | `IF`      |
| `WHILE`     | `WHILE`    | `RETURN`       | `RETURN`  |
| `QUOTE`     | `"`        | `SINGLE_QUOTE` | `'`       |

<br>

## 식 (Expression)

`IF`, `Function` 식을 제외한 모든 식은 세미콜론 (`;`)을 붙여야 합니다.

| 식        | 문법                              | 식         | 문법                         |
| --------- | --------------------------------- | ---------- | ---------------------------- |
| `Literal` |                                   | `Block`    | `{ [expr] }`                 |
| `If`      | `if (expr) [block] else [block];` | `Function` | `func [name?](args) [block]` |
| `Call`    | `ident(args)`                     | `Ident`    |                              |
| `Array`   | `[expr, expr, ...]`               | `Index`    | `ident[number]`              |
| `Hash`    | `{ string: expr, ... }`           | `Assign`   | `ident = expr`               |

<br>

## 구문 (Statement)

| 구문     | 문법                | 구문    | 문법                    |
| -------- | ------------------- | ------- | ----------------------- |
| `Let`    | `let ident = expr;` | `While` | `while (expr) [block];` |
| `Return` | `return expr;`      | `Block` | `{ statement }`         |

<br>

## 우선순위 (Priority)

`LOWEST` > `EQUAL` > `LESSGREATER` > `SUM` > `PRODUCT` > `PREFIX` > `CALL` > `INDEX`

<br>

## 연산자 (Operator)

| 연산자 | 문법                 | 지원 유형                                             |
| ------ | -------------------- | ----------------------------------------------------- |
| `+`    | `Literal + Literal`  | `number`, `array`, `string`, `hash`                   |
| `-`    | `Literal - Literal`  | `number`                                              |
| `*`    | `Literal * Literal`  | `number`                                              |
| `/`    | `Literal / Literal`  | `number`                                              |
| `%`    | `Literal % Literal`  | `number`                                              |
| `==`   | `Literal == Literal` | `number, string, boolean, array, hash`                |
| `!=`   | `Literal != Literal` | `number, string, boolean, array, hash`                |
| `<`    | `Literal < Literal`  | `number`                                              |
| `>`    | `Literal > Literal`  | `number`                                              |
| `<=`   | `Literal <= Literal` | `number`                                              |
| `>=`   | `Literal >= Literal` | `number`                                              |
| `<-`   | `Literal <- Literal` | `array, hash`, `Any`                                  |
| `??`   | `Literal ?? Literal` | `Any`                                                 |
| `in`   | `Literal in Literal` | `string, number, hash`, `string, number, hash, array` |

<br>

## Literal

| 타입      | 문법                                         |
| --------- | -------------------------------------------- |
| `string`  | `"String"`, `'String'`                       |
| `number`  | `[-?]Number.[Number?]`                       |
| `boolean` | `true`, `false`                              |
| `dict`    | `{ [key (String, Number)]: [value (Any)], }` |
| `array`   | `[value (Any)]`                              |
| `func`    | `func [name?]([args]) [block]`               |

<br>

# 내장 함수 (Built-in Function)

| 함수      | 매개 변수 |
| --------- | --------- |
| `import`  | `string`  |
| `eval`    | `string`  |
| `js`      | `string`  |
| `convert` | `Any`     |
| `options` |           |

<br>

# 표준 라이브러리

-   [**`@std/`**](https://github.com/tsukiroku/tiny/blob/main/@std/)
    -   [`lib`](https://github.com/tsukiroku/tiny/blob/main/@std/lib.tiny)
    -   [`io`](https://github.com/tsukiroku/tiny/blob/main/@std/io.tiny)
        -   `print(args*)`
        -   `println(args*)`
        -   `readline`
    -   [`array`](https://github.com/tsukiroku/tiny/blob/main/@std/array.tiny)
        -   `push(array, value)`
        -   `pop(array)`
        -   `shift(array)`
        -   `unshift(array, value)`
        -   `slice(array, start, end)`
        -   `join(array, separator)`
        -   `forEach(array, callback)`
        -   `repeat(value, count)`, `repeat(count)`
    -   [`util`](https://github.com/tsukiroku/tiny/blob/main/@std/util.tiny)
        -   `funcTools`
        -   `length(array)`
        -   `match(value, [pattern], default)`
        -   `string(value)`
        -   `number(value)`
        -   `boolean(value)`
        -   `ternary(condition, trueValue, falseValue)`
    -   [`string`]
        -   `split(string, separator)`
        -   `concat(args*)`
        -   `replace(string, pattern, replacement)`
        -   `subString(string, start, end)`
        -   `rTest(string, pattern)`
        -   `rMatch(string, pattern)`
    -   [`object`](https://github.com/tsukiroku/tiny/blob/main/@std/object.tiny)
        -   `assign(object, key, value)`

<br>

# 옵션

If `tiny.config.json` dose not exist in root (`./`), it Default.

| Option                   | Description                            | Default |
| ------------------------ | -------------------------------------- | ------- |
| `allowEval`              | `eval()` 기능을 활성화합니다.          | `false` |
| `allowJavaScript`        | Allow `js()` 기능을 활성화합니다.      | `false` |
| `useStdLibAutomatically` | 자동으로 표준 라이브러리를 가져옵니다. | `false` |
| `stderrPrefix`           | 오류 메세지에 접두사를 추가합니다.     | `true`  |
| `stderrColor`            | 오류 메세지에 색을 추가합니다.         | `true`  |
| `locale`                 | 지역화                                 | `en`    |

<br>

# Npm 패키지

```sh
npm i @tsukiroku/tiny
```

```ts
import Tiny, { NULL } from '@tsukiroku/tiny';

console.log(
    new Tiny('let x = "World!"; println("Hello, " + x);', {
        useStdLibAutomatically: true,
    })
        .setBuiltins(new Map([['test', () => NULL]]))
        .applyBuiltins()
        .eval()
);
```

`@std/` 가 프로젝트 루트(`./`)에 있어야 합니다.

<br>

# 예제

-   [**`./examples`**](https://github.com/tsukiroku/tiny/tree/main/examples)
    -   [`Hello, World!`](https://github.com/tsukiroku/tiny/blob/main/examples/hello_world.tiny)
    -   [`Fibonacci`](https://github.com/tsukiroku/tiny/blob/main/examples/fibonacci.tiny)
    -   [`Function`](https://github.com/tsukiroku/tiny/blob/main/examples/function.tiny)
    -   [`If`](https://github.com/tsukiroku/tiny/blob/main/examples/if.tiny)
    -   [`While`](https://github.com/tsukiroku/tiny/blob/main/examples/while.tiny)
    -   [`Import`](https://github.com/tsukiroku/tiny/blob/main/examples/import.tiny)
    -   [`Variable`](https://github.com/tsukiroku/tiny/blob/main/examples/variable.tiny)
    -   [`Operators`](https://github.com/tsukiroku/tiny/blob/main/examples/operators.tiny)
    -   [`StdLib`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib)
        -   [`Array`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/array.tiny)
        -   [`IO`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/io.tiny)
        -   [`Utility`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/util.tiny)

<br>

---

<br>

# 문서

-   [변수](#변수)
    -   [데이터 타입](#데이터-타입)
-   [함수](#함수)
-   [연산자](#연산자-1)
-   [흐름 제어](#흐름-제어)
    -   [If](#if)
    -   [While](#while)
-   [Import](#import)
-   [데코레이터](#데코레이터)
-   [내장 함수](#내장-함수)
-   [표준 라이브러리](#표준-라이브러리)
    -   [IO](#io)
    -   [Utility](#utility)
    -   [Array](#array)
    -   [Object](#object)
    -   [String](#string)

예제를 확인하려면, [`Examples`](./examples/README.md)를 확인하세요.

# 변수

```
let <identifier> = <expression>;

<identifier> = <expression>;
```

> [`<expression>`](#expression) 상속

---

```swift
let foo = 1;

foo = 2;
```

# Data types

## 문자열

```
'Hello, World!'
"안녕, 세상아!"
```

## 숫자

```
12345

3.141592
```

## 논리

```
true, false
```

## 배열

```
[1, 2, 3, 'Foo', 'Bar', [1, 2, 3]]
```

## 헤시

```
{
    'foo': 'bar',
    bar: false,
    baz: [1, 2, 3],
    5: {
        x: func() {
            return 1;
        }
    }
}
```

## 함수

```
<arguments>: <identifier>, <identifier>, ...

func <identifier>(<arguments>) <block expression>;

func(<arguments>) <block expression>;
```

> [`<block expression>`](#block-식) 상속

---

```swift
func foo(a, b) {
    return a + b;
}

let bar = func(a, b) {
    return a + b;
};
```

# 연산자

```
<operator>: +, -, *, /, %, ==, !=, <, >, <=, >=, <-, ??, in

<left expression> <operator> <right expression>
```

> [`<expression>`](#식) 상속

---

```swift
let x = {
    foo: 5
};

x <- "foo";

null() ?? 1;
2 ?? 3;
```

`in` 연산자에 대한 정보는 [Examples/Operators](./examples/operators.tiny)를 참조하세요.

# 흐름 제어

## If

```
if <condition expression [boolean]> <block expression>
else <block expression>
```

> [`<block expression>`](#block-식) 상속

---

```swift
if (condition) {
    implement();
} else if (condition) {
    implement();
} else implement();
```

## While

```
while <condition expression [boolean]> <block expression>
```

> [`<block expression>`](#block-식) 상속

---

```swift
while (condition) {
    implement();
}
```

# Import

> [`import()`](#import-1)

---

```
<use> <string>;
```

> [`string`](#문자열)

---

```perl
use './module/myLib';
```

# 데코레이터

```
@<hash>
<function> // func <identifier>(<arguments>) <block expression>;
```

> [`<hash>`](#헤시), [`<function>`](#함수)

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

# 내장 함수

## import

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

`.tiny` 확장자를 포함하지 않으면, 자동으로 `.tiny` 확장자를 추가합니다.

## delete

```swift
let x = 5;

delete("x");

println(x); // 식별자 'x' 이(가) 정의되지 않았습니다.
```

## eval

```swift
eval("5 + 5"); // 10
```

<br>

`allowEval` 옵션이 활성화 되어있어야 합니다.

**위험한 기능이므로, 신중히 사용하세요.**

## js

```swift
js("console.log('foo')");
```

`allowJavaScript` 옵션이 활성화 되어있어야 합니다.

**위험한 기능이므로, 신중히 사용하세요.**

## convert

> [`string()`, `number()`, `boolean()`](#string-number-boolean)

## options

```swift
options(); // hash
```

# 표준 라이브러리

# IO

## print

```swift
println("Hello, World!", 10);
```

## println

```swift
println("Hello, World!");
```

## readline

```swift
let line = readline();

println(line);
```

# Utility

## length

```swift
length([1, 2, 3]); // 3
```

## match

```swift
println(match(3, [
    [ 1, func(v) { return value + 1; } ],
    [ 2, func(v) { return value + 2; } ]
], func(v) {
    println('nothing');
    return v * 10;
}));
```

## string, number, boolean

```swift
string(5); // "5"
number("5"); // 5
boolean(0); // false
```

## ternary

```swift
ternary(true, "foo", "bar"); // "foo"
ternary(false, "foo", "bar"); // "bar"
```

# Array

```swift
let arr = [1, 2, 3];
```

## push

```swift
push(array, 4); // [1, 2, 3, 4]
```

## pop

```swift
pop(array); // [1, 2]
```

## shift

```swift
shift(array); // [2, 3]
```

## unshift

```swift
unshift(array, 0); // [0, 1, 2, 3]
```

## slice

```swift
slice(array, 1, 3); // [2, 3]
```

## join

```swift
join(array, ", "); // "1, 2, 3"
```

## forEach

```swift
forEach(array, func(value, index) {
    println(index, value);
});
```

## repeat

```swift
repeat(5); // [NULL, NULL, NULL, NULL, NULL]

repeat("foo", 3); // ["foo", "foo", "foo"]
```

# Object

## assign

```swift
let x = {
    a: 5,
};

// (x <- "a") = 10; // Error

x = assign(x, "a", 10);
```

# String

## split

```swift
split("foo bar baz", " "); // ["foo", "bar", "baz"]
```

## concat

```swift
concat("foo", "bar", "baz"); // "foobarbaz"
```

## replace

```swift
replace("foo bar baz", " ", ", "); // "foo, bar, baz"
```

## subString

```swift
subString("foo bar baz", 4, 7); // "bar"
```

## rTest

```swift
rTest("[A-Z]", "ABCD"); // true
rTest("[A-Z]", "abcd"); // false
```

## rMatch

```swift
rMatch("[A-Z]", "ABCD"); // ["A", "B", "C", "D"]
```

---

# 식

```
<expression>;
```

# Block 식

```
<keywords> {
    implement();
}

<if> implement(); // only `if` body
```

> [`<keywords>`](#키워드), [`<if>`](#if)

# 구문

```
<let>, <return>, <while>, <block expression>, <expression statement>
```

> [`<let>`](#변수), [`<return>`](#반환), [`<while>`](#while), [`<block expression>`](#block-식), [`<expression statement>`](#식)

# 키워드

```
<let>, <func>, <true>, <false>, <if>, <else>, <return>, <while>, <in>, <typeof>, <null>, <throw>, <delete>, <use>
```

> [`<let>`](#변수), [`<func>`](#함수), [`<true>`](#boolean), [`<false>`](#boolean), [`<if>`](#if), [`<else>`](#if), [`<return>`](#return), [`<while>`](#while), [`<in>`](#operators-1), [`<use>`](#import-1)

---

## typeof

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

## null

```swift
null; // NULL
```

## throw

```
<throw> <expr>
```

<br>

```swift
throw 'Error'; // Error
```

## delete

```
<delete> <expr>
```

<br>

```js
let a = 10;

delete a;

a; // Identifier 'a' is not defined.
```

# 반환

```
<keywords> {
    implement();

    return null();
} // `NULL`

<if> null(); // `NULL`
```

> [`<keywords>`](#키워드), [`<if>`](#if), [`<block expression>`](#block-식) 상속
