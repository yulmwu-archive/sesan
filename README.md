[English](./README.md) | [한국어](./README_KR.md)

[Docs](#documentation) | [문서](./README_KR.md#문서)

---

-   [**Introduce**](#Introduce)
    -   [How it works?](#how-it-works)
    -   [Start REPL](#start-repl)
        -   [REPL commands](#repl-commands)
    -   [Web Playground](#web-playground)
-   [**Interpreter**](#Interpreter)
    -   Tokenizer
        -   [Tokens](#tokens)
    -   Parser
        -   [Expressions](#expressions)
        -   [Statements](#statements)
        -   [Priority](#priority)
        -   [Operators](#operators)
-   [**Built-in functions**](#Built-in-functions)
-   [**Standard library**](#Standard-library)
-   [**Options**](#Options)
-   [**Npm package**](#Npm-Package)
-   [**Examples**](#Examples)

<br>

# Introduce

## How it works?

```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator -> [Repl]
```

<br>

## Start REPL

```sh
# Install dependencies
npm i

# REPL
npm run start:repl

# You can also from a file.
npm run start:repl [file]
```

<br>

## REPL commands

`//command ...args`

| Command | Description                                        |
| ------- | -------------------------------------------------- |
| `exit`  | Exit the repl                                      |
| `mode`  | Change the mode (`repl`, `lexer`, `parser`, `env`) |

<br>

# Web Playground

[Click here](https://tsukiroku.github.io/tiny)

<br>

# Interpreter

## Tokens

| Token       | Identifier | Token          | Identifier |
| ----------- | ---------- | -------------- | ---------- |
| `EOF`       | `EOF`      | `ILLEGAL`      | `ILLEGAL`  |
| `NUMBER`    | `NUMBER`   | `IDENT`        | `IDENT`    |
| `TRUE`      | `TRUE`     | `STRING`       | `STRING`   |
| `FUNCTION`  | `FUNCTION` | `FALSE`        | `FALSE`    |
| `ASSIGN`    | `=`        | `COMMENT`      | `COMMENT`  |
| `MINUS`     | `-`        | `PLUS`         | `+`        |
| `ASTERISK`  | `*`        | `BANG`         | `!`        |
| `PERCENT`   | `%`        | `SLASH`        | `/`        |
| `GT`        | `>`        | `LT`           | `<`        |
| `NOT_EQUAL` | `!=`       | `EQUAL`        | `==`       |
| `COLON`     | `:`        | `COMMA`        | `,`        |
| `LPAREN`    | `(`        | `SEMICOLON`    | `;`        |
| `LBRACE`    | `{`        | `RPAREN`       | `)`        |
| `LBRACKET`  | `[`        | `RBRACE`       | `}`        |
| `LET`       | `LET`      | `RBRACKET`     | `]`        |
| `ELSE`      | `ELSE`     | `IF`           | `IF`       |
| `WHILE`     | `WHILE`    | `RETURN`       | `RETURN`   |
| `QUOTE`     | `"`        | `SINGLE_QUOTE` | `'`        |

<br>

## Expressions

Except for `If`, `Function` Expression, all expressions must be preceded by a semicolon (`;`);

| Expression | Syntax                            | Expression | Syntax                       |
| ---------- | --------------------------------- | ---------- | ---------------------------- |
| `Literal`  |                                   | `Block`    | `{ [expr] }`                 |
| `If`       | `if (expr) [block] else [block];` | `Function` | `func [name?](args) [block]` |
| `Call`     | `ident(args)`                     | `Ident`    |                              |
| `Array`    | `[expr, expr, ...]`               | `Index`    | `ident[number]`              |
| `Hash`     | `{ string: expr, ... }`           | `Assign`   | `ident = expr`               |

<br>

## Statements

| Statement | Syntax              | Statement | Syntax                  |
| --------- | ------------------- | --------- | ----------------------- |
| `Let`     | `let ident = expr;` | `While`   | `while (expr) [block];` |
| `Return`  | `return expr;`      | `Block`   | `{ statement }`         |

<br>

## Priority

`LOWEST` > `EQUAL` > `LESSGREATER` > `SUM` > `PRODUCT` > `PREFIX` > `CALL` > `INDEX`

<br>

## Operators

| Operator | Syntax               | Literal Type                                          |
| -------- | -------------------- | ----------------------------------------------------- |
| `+`      | `Literal + Literal`  | `number`, `array`, `string`, `hash`                   |
| `-`      | `Literal - Literal`  | `number`                                              |
| `*`      | `Literal * Literal`  | `number`                                              |
| `/`      | `Literal / Literal`  | `number`                                              |
| `%`      | `Literal % Literal`  | `number`                                              |
| `==`     | `Literal == Literal` | `number, string, boolean, array, hash`                |
| `!=`     | `Literal != Literal` | `number, string, boolean, array, hash`                |
| `<`      | `Literal < Literal`  | `number`                                              |
| `>`      | `Literal > Literal`  | `number`                                              |
| `<=`     | `Literal <= Literal` | `number`                                              |
| `>=`     | `Literal >= Literal` | `number`                                              |
| `<-`     | `Literal <- Literal` | `array, hash`, `Any`                                  |
| `??`     | `Literal ?? Literal` | `Any`                                                 |
| `in`     | `Literal in Literal` | `string, number, hash`, `string, number, hash, array` |

<br>

## Literal

| Type      | Syntax                                       |
| --------- | -------------------------------------------- |
| `string`  | `"String"`, `'String'`                       |
| `number`  | `[-?]Number.[Number?]`                       |
| `boolean` | `true`, `false`                              |
| `dict`    | `{ [key (String, Number)]: [value (Any)], }` |
| `array`   | `[value (Any)]`                              |
| `func`    | `func [name?]([args]) [block]`               |

<br>

# Built-in functions

| Function  | Arguments |
| --------- | --------- |
| `import`  | `string`  |
| `eval`    | `string`  |
| `js`      | `string`  |
| `convert` | `Any`     |
| `options` |           |

<br>

# Standard library

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
        -   `split(string, separator)`
        -   `concat(args*)`
    -   [`object`](https://github.com/tsukiroku/tiny/blob/main/@std/object.tiny)
        -   `assign(object, key, value)`

<br>

# Options

If `tiny.config.json` dose not exist in root (`./`), it extends Default.

| Option                   | Description                        | Default |
| ------------------------ | ---------------------------------- | ------- |
| `allowEval`              | Allow `eval()` feature             | `false` |
| `allowJavaScript`        | Allow `js()` feature               | `false` |
| `useStdLibAutomatically` | Use standard library automatically | `false` |
| `stderrPrefix`           | Prefix for stderr                  | `true`  |
| `stderrColor`            | Color for stderr                   | `true`  |
| `locale`                 | Locale                             | `en`    |

<br>

# Npm package

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

`@std/` must exist in root (`./`).

<br>

# Examples

-   [**`./examples`**](https://github.com/tsukiroku/tiny/tree/main/examples)
    -   [`Hello, World!`](https://github.com/tsukiroku/tiny/blob/main/examples/hello_world.tiny)
    -   [`Fibonacci`](https://github.com/tsukiroku/tiny/blob/main/examples/fibonacci.tiny)
    -   [`Function`](https://github.com/tsukiroku/tiny/blob/main/examples/function.tiny)
    -   [`If`](https://github.com/tsukiroku/tiny/blob/main/examples/if.tiny)
    -   [`While`](https://github.com/tsukiroku/tiny/blob/main/examples/while.tiny)
    -   [`Import`](https://github.com/tsukiroku/tiny/blob/main/examples/import.tiny)
    -   [`Variable`](https://github.com/tsukiroku/tiny/blob/main/examples/variable.tiny)
    -   [`Operators`](https://github.com/tsukiroku/tiny/blob/main/examples/operators.tiny)
    -   [`Built-in functions`](https://github.com/tsukiroku/tiny/blob/main/examples/builtin.tiny)
    -   [`Decorators`](https://github.com/tsukiroku/tiny/blob/main/examples/decorators.tiny)
    -   [`StdLib`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib)
        -   [`Array`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/array.tiny)
        -   [`IO`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/io.tiny)
        -   [`Utility`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/util.tiny)

<br>

---

<br>

# Documentation

-   [Variable](#variables)
    -   [Data type](#data-types)
-   [Function](#function)
-   [Operator](#operators-1)
-   [Control flow](#control-flow)
    -   [If](#if)
    -   [While](#while)
-   [Import](#import)
-   [Decorator](#decorator)
-   [Built-in functions](#built-in-functions-1)
-   [Standard library](#standard-library-1)
    -   [IO](#io)
    -   [Utility](#utility)
    -   [Array](#array)
    -   [Object](#object)

For examples, see [`Examples`](./examples/README.md)

# Variables

```
let <identifier> = <expression>;

<identifier> = <expression>;
```

> extends [`<expression>`](#expression)

---

```swift
let foo = 1;

foo = 2;
```

# Data types

## string

```
'Hello, World!'
"안녕, 세상아!"
```

## number

```
12345

3.141592
```

## boolean

```
true, false
```

## array

```
[1, 2, 3, 'Foo', 'Bar', [1, 2, 3]]
```

## hash

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

## function

```
<arguments>: <identifier>, <identifier>, ...

func <identifier>(<arguments>) <block expression>;

func(<arguments>) <block expression>;
```

> extends [`<block expression>`](#block-expression)

---

```swift
func foo(a, b) {
    return a + b;
}

let bar = func(a, b) {
    return a + b;
};
```

# Operators

```
<operator>: +, -, *, /, %, ==, !=, <, >, <=, >=, <-, ??, in

<left expression> <operator> <right expression>
```

> extends [`<expression>`](#expression)

---

```swift
let x = {
    foo: 5
};

x <- "foo";

null() ?? 1;
2 ?? 3;
```

See [Examples/Operators](./examples/operators.tiny) for `in` operator.

# Control flow

## If

```
if <condition expression [boolean]> <block expression>
else <block expression>
```

> extends [`<block expression>`](#block-expression)

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

> extends [`<block expression>`](#block-expression)

---

```swift
while (condition) {
    implement();
}
```

# Import

> extends [`import()`](#import-1)

---

```
<use> <string>;
```

> extends [`string`](#string)

---

```perl
use './module/myLib';
```

# Decorator

```
@<hash>
<function> // func <identifier>(<arguments>) <block expression>;
```

> extends [`<hash>`](#hash), [`<function>`](#function)

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

# Built-in functions

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

If `.tiny` is not included in path, `.tiny` will be added automatically.

## delete

```swift
let x = 5;

delete("x");

println(x); // Identifier 'x' is not defined.
```

## eval

```swift
eval("5 + 5"); // 10
```

<br>

`allowEval` must be `true`.

**This feature is a dangerous feature. be careful.**

## js

```swift
js("console.log('foo')");
```

`allowJavaScript` must be `true`.

**This feature is a dangerous feature. be careful.**

## convert

> extends [`string()`, `number()`, `boolean()`](#string-number-boolean)

## options

```swift
options(); // hash
```

# Standard library

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

## split

```swift
split("foo bar baz", " "); // ["foo", "bar", "baz"]
```

## concat

```swift
concat("foo", "bar"); // "foo bar"
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

---

# Expression

```
<expression>;
```

# Block Expression

```
<keywords> {
    implement();
}

<if> implement(); // only `if` body
```

> extends [`<keywords>`](#keywords), [`<if>`](#if)

# Statement

```
<let>, <return>, <while>, <block expression>, <expression statement>
```

> extends [`<let>`](#variables), [`<return>`](./return), [`<while>`](#while), [`<block expression>`](#block-expression), [`<expression statement>`](#expression)

# Keywords

```
<let>, <func>, <true>, <false>, <if>, <else>, <return>, <while>, <in>, <typeof>, <null>, <throw>, <delete>, <use>
```

> extends [`<let>`](#variables), [`<func>`](#function), [`<true>`](#boolean), [`<false>`](#boolean), [`<if>`](#if), [`<else>`](#if), [`<return>`](#return), [`<while>`](#while), [`<in>`](#operators-1), [`<use>`](#import-1)

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

# Return

```
<keywords> {
    implement();

    return null();
} // `NULL`

<if> null(); // `NULL`
```

> extends [`<keywords>`](#keywords), [`<if>`](#if), [`<block expression>`](#block-expression)
