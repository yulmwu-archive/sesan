-   [Introduce](#introduce)
    -   [How it works?](#how-it-works)
    -   [Start REPL](#start-repl)
    -   [REPL commands](#repl-commands)
-   [Web Playground](#web-playground)
-   [Interpreter](#interpreter)
    -   [Tokens](#tokens)
    -   [Expressions](#expressions)
    -   [Statements](#statements)
    -   [Priority](#priority)
    -   [Operators](#operators)
    -   [Literal](#literal)
-   [Built-in functions](#built-in-functions)
-   [Standard library](#standard-library)
-   [Options](#options)
    -   [Strict mode](#strict-mode)
-   [Npm package](#npm-package)
-   [Examples](#examples)
-   [Documentation](#documentation)

<br />

# Introduce

## How it works?

```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator -> [Repl]
```

<br />

## Start REPL

```sh
# Install dependencies
npm i

# REPL
npm run start:repl

# You can also from a file.
npm run start:repl [file]
```

<br />

## REPL commands

`//command ...args`

| Command | Description                                        |
| ------- | -------------------------------------------------- |
| `exit`  | Exit the repl                                      |
| `mode`  | Change the mode (`repl`, `lexer`, `parser`, `env`) |

<br />

# Web Playground

[README](./web) | [Playground](https://tsukiroku.github.io/tiny)

<br />

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

<br />

## Expressions

Except for `If`, `Function` Expression, all expressions must be preceded by a semicolon (`;`);

| Expression | Syntax                            | Expression | Syntax                       |
| ---------- | --------------------------------- | ---------- | ---------------------------- |
| `Literal`  |                                   | `Block`    | `{ [expr] }`                 |
| `If`       | `if (expr) [block] else [block];` | `Function` | `func [name?](args) [block]` |
| `Call`     | `ident(args)`                     | `Ident`    |                              |
| `Array`    | `[expr, expr, ...]`               | `Index`    | `ident[number]`              |
| `Hash`     | `{ string: expr, ... }`           | `Assign`   | `[ident / index] = expr`     |

<br />

## Statements

| Statement | Syntax              | Statement | Syntax                  |
| --------- | ------------------- | --------- | ----------------------- |
| `Let`     | `let ident = expr;` | `While`   | `while (expr) [block];` |
| `Return`  | `return expr;`      | `Block`   | `{ statement }`         |

<br />

## Priority

`1 < ... < 10`

| Priority Number | Operator                                               |
| --------------- | ------------------------------------------------------ |
| `10`            | `Nullish (??)`, `Element (<-, .)`, `Index ([])`        |
| `9`             | `Function Call`                                        |
| `8`             | `typeof`, `delete`, `throw`, `use`, `Prefix (!, -, +)` |
| `7`             | `Multiplication (*, /, %)`                             |
| `6`             | `Addition (+, -)`                                      |
| `5`             | `Comparison (>, <, >=, <=, in)`                        |
| `4`             | `Equality (==, !=)`                                    |
| `3`             | <code>Logical (&&, &#124;&#124;)</code>                |
| `2`             | `Assignment (=)`                                       |
| `1`             | `...`                                                  |

<br />

## Operators

| Operator | Syntax       | Literal Type                                          |
| -------- | ------------ | ----------------------------------------------------- |
| `+`      | `... + ...`  | `number`, `array`, `string`, `hash`                   |
| `-`      | `... - ...`  | `number`                                              |
| `*`      | `... * ...`  | `number`                                              |
| `/`      | `... / ...`  | `number`                                              |
| `%`      | `... % ...`  | `number`                                              |
| `==`     | `... == ...` | `number, string, boolean, array, hash`                |
| `!=`     | `... != ...` | `number, string, boolean, array, hash`                |
| `<`      | `... < ...`  | `number`                                              |
| `>`      | `... > ...`  | `number`                                              |
| `<=`     | `... <= ...` | `number`                                              |
| `>=`     | `... >= ...` | `number`                                              |
| `<-`     | `... <- ...` | `array, hash`, `Any`                                  |
| `.`      | extends `<-` | extends `<-`                                          |
| `??`     | `... ?? ...` | `Any`                                                 |
| `in`     | `... in ...` | `string, number, hash`, `string, number, hash, array` |

<br />

## Literal

| Type      | Syntax                                       |
| --------- | -------------------------------------------- |
| `string`  | `"String"`, `'String'`                       |
| `number`  | `[-?]Number.[Number?]`                       |
| `boolean` | `true`, `false`                              |
| `dict`    | `{ [key (String, Number)]: [value (Any)], }` |
| `array`   | `[value (Any)]`                              |
| `func`    | `func [name?]([args]) [block]`               |

<br />

# Built-in functions

| Function          | Arguments          |
| ----------------- | ------------------ |
| `import`          | `string`           |
| `eval`            | `string`           |
| `js`              | `string`           |
| `convert`         | `Any`              |
| `options`         |                    |
| `setOption`       | `string`, `string` |
| [`regex`](#rtest) |                    |

<br />

# Standard library

-   [**`@std/`**](https://github.com/tsukiroku/tiny/blob/main/@std/)
    -   [`lib`](https://github.com/tsukiroku/tiny/blob/main/@std/lib.tiny)
    -   [`io`](https://github.com/tsukiroku/tiny/blob/main/@std/io.tiny)
        -   `print(args*)`
        -   `println(args*)`
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

<br />

# Options

If `tiny.config.json` dose not exist in root (`./`), it extends Default.

| Option                   | Description                        | Default |
| ------------------------ | ---------------------------------- | ------- |
| `allowEval`              | Allow `eval()` feature             | `false` |
| `allowJavaScript`        | Allow `js()` feature               | `false` |
| `useStdLibAutomatically` | Use standard library automatically | `false` |
| `stderrPrefix`           | Prefix for stderr                  | `true`  |
| `stderrColor`            | Color for stderr                   | `true`  |
| `strictMode`             | Strict mode                        | `false` |
| `locale`                 | Locale                             | `en`    |

## Strict mode

```diff
+ Variables cannot be redeclared.
+ Functions cannot be redeclared.
```

<br />

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

<br />

# Examples

-   [**`./examples`**](https://github.com/tsukiroku/tiny/tree/main/examples)
    -   [`Hello, World!`](https://github.com/tsukiroku/tiny/blob/main/examples/hello_world.tiny)
    -   [`Fibonacci`](https://github.com/tsukiroku/tiny/blob/main/examples/fibonacci.tiny)
    -   [`Function`](https://github.com/tsukiroku/tiny/blob/main/examples/function.tiny)
    -   [`Hash`](https://github.com/tsukiroku/tiny/blob/main/examples/hash.tiny)
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
        -   [`String`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/string.tiny)
        -   [`Utility`](https://github.com/tsukiroku/tiny/blob/main/examples/stdlib/util.tiny)

<br />

---

<br />

# Documentation

-   [Variables](#variables)
    -   [Data types](#data-types)
        -   [string](#string)
        -   [number](#number)
        -   [boolean](#boolean)
        -   [array](#array)
        -   [hash](#hash)
        -   [function](#function)
-   [Operators](#operators-1)
    -   [`+` (Plus) Operator](#-plus-operator)
    -   [`-` (Minus) Operator](#--minus-operator)
    -   [`*` (Multiply) Operator](#-multiply-operator)
    -   [`/` (Divide) Operator](#-divide-operator)
    -   [`%` (Modulo) Operator](#-modulo-operator)
    -   [`==`, `!=`, `<`, `>`, `<=`, `>=` Operators](#------operators)
    -   [`<-`, `.` Operator](#---operator)
-   [Control flow](#control-flow)
    -   [If](#if)
    -   [While](#while)
-   [Import](#import)
-   [Decorator](#decorator)
-   [Built-in functions](#built-in-functions-1)
    -   [import](#import-1)
    -   [eval](#eval)
    -   [js](#js)
    -   [convert](#convert)
    -   [options](#options-1)
-   [Standard library](#standard-library-1)
    -   [IO](#io)
        -   [print](#print)
        -   [println](#println)
    -   [Utility](#utility)
        -   [length](#length)
        -   [match](#match)
        -   [string, number, boolean](#string-number-boolean)
        -   [ternary](#ternary)
    -   [Array](#array-1)
        -   [push](#push)
        -   [pop](#pop)
        -   [shift](#shift)
        -   [unshift](#unshift)
        -   [slice](#slice)
        -   [join](#join)
        -   [forEach](#foreach)
        -   [repeat](#repeat)
    -   [String](#string-1)
        -   [split](#split)
        -   [concat](#concat)
        -   [replace](#replace)
        -   [subString](#substring)
        -   [rTest](#rtest)
        -   [rMatch](#rmatch)
-   [Expression](#expression)
-   [Block Expression](#block-expression)
-   [Statement](#statement)
-   [Keywords](#keywords)
    -   [typeof](#typeof)
    -   [null](#null)
    -   [throw](#throw)
    -   [delete](#delete)
-   [Return](#return)

For examples, see [`Examples`](./examples/README.md)

<br />

# Variables

```
let <identifier> = <expression>;

<identifier> = <expression>;
```

> extends [`<expression>`](#expression)

---

```
let foo = 1;

foo = 2;
```

---

If the `strict` option is enabled, redeclaration is not allowed.

if the variable prefix contains `_`, `strict` option is ignored and redeclaration is allowed.

variable names use `camelCase` or `snake_case` and, cannot use numbers as variable prefixes.

<br />

## Data types

### string

```
'Hello, World!'
"안녕, 세상아!"
```

---

Can start the string with `'` or `"`, and the content supports all [`Unicode`](https://en.wikipedia.org/wiki/Unicode).

### number

```
12345

3.141592
```

### boolean

```
true, false
```

---

To convert another value to a boolean value, you can use the [`boolean`](#string-number-boolean), or use the `!!` prefix.

### array

```
[1, 2, 3, 'Foo', 'Bar', [1, 2, 3]]

[1, 2, 3][1]    // 2

[1, 2, 3] <- 1  // 2
```

---

Array elements can be accessed via the `index` or [`element`](#--operator) operator.

### hash

```
let hash = {
    'foo': 'bar',
    bar: false,
    baz: [1, 2, 3],
    5: {
        x: func() {
            return 1;
        }
    }
}

hash['foo']      // 'bar'
hash.bar         // false
hash <- 5 <- x() // 1
```

---

Hash is a pair of keys and values.

the key must be of type [`string`](#string) or [`number`](#number), and the value can be any type.

hash pairs are can be accessed via the `index` or [`element`](#---operator) operator.

### function

```
<arguments>: <identifier>, <identifier>, ...

func <identifier>(<arguments>) <block expression>;

func(<arguments>) <block expression>;
```

> extends [`<block expression>`](#block-expression)

---

```
func foo(a, b) {
    return a + b;
}

let bar = func(a, b) {
    return a + b;
};
```

---

Functions can be declared with [`hard coding`](https://en.wikipedia.org/wiki/Hard_coding), and supports anonymous functions.

if the `strict` option is enabled, redeclaration is not allowed.

if the function prefix contains `_`, `strict` option is ignored and redeclaration is allowed.

function names use `camelCase` or `snake_case` and, cannot use numbers as variable prefixes.

<br />

# Operators

```
<operator>: +, -, *, /, %, ==, !=, <, >, <=, >=, <-, ., ??, in

<left expression> <operator> <right expression>
```

> extends [`<expression>`](#expression)

---

## `+` (Plus) Operator

The `+` operator is addition, and can add [`number`](#number), [`string`](#string), [`array`](#array), [`hash`](#hash).

`number + number` : Add the right operand to the left operand.

`string + string` : Concatenate the right operand to the left operand.

`array + array` : Concatenate the right operand to the left operand.

`hash + hash` : Add the right operand to the left operand. if there are duplicate keys, the right operand is overwritten.

## `-` (Minus) Operator

The `-` operator is subtraction, and can subtract [`number`](#number).

## `*` (Multiply) Operator

The `*` operator is multiplication, and can multiply [`number`](#number).

## `/` (Divide) Operator

The `/` operator is division, and can divide [`number`](#number).

## `%` (Modulo) Operator

The `%` operator is modulo, and can modulo [`number`](#number).

## `==`, `!=`, `<`, `>`, `<=`, `>=` Operators

The `==`, `!=`, `<`, `>`, `<=`, `>=` operators are comparison operators, and can compare any type.

## `<-`, `.` Operator

The `element` operator, which can access array or Hash elements.

```
[1, 2, 3] <- 1       // 2

[1, 2, 3].1          // 2

let hash = {
    foo: {
        bar: 'baz'
    },
};

hash <- foo <- bar   // 'baz'
hash.foo.bar         // 'baz'

hash['foo']['bar'] = 'qux';
```

Cannot reassign values ​​with the `element` operator, must use `index`.

<br />

# Control flow

## If

```
if <condition expression [boolean]> <block expression>
else <block expression>
```

> extends [`<block expression>`](#block-expression)

---

```
if (condition) {
    implement();
} else if (condition) {
    implement();
} else implement();
```

---

Can use `if`, `else` and `else if`.

the `condition` of `if` is a boolean value, non-boolean values ​​should use `!!`.

```
!!2    // true
!!0    // false
!!null // false
```

## While

```
while <condition expression [boolean]> <block expression>
```

> extends [`<block expression>`](#block-expression)

---

```
while (condition) {
    implement();
}
```

---

If `condition` is true, the `block expression` is executed.

the `condition` of `while` is a boolean value, non-boolean values ​​should use `!!`.

does not support `break` and `continue`. This can be used with [`forEach`](#foreach).

<br />

# Import

```
<use> <string>;
```

> extends [`string`](#string)

---

```
use './module/myLib';
```

---

Executes external source code and can import executed environments.

path follows the project root (default `./`).

if `.tiny` is not included in path, `.tiny` will be added automatically.

<br />

# Decorator

```
@<hash>
<function> // func <identifier>(<arguments>) <block expression>;
```

> extends [`<hash>`](#hash), [`<function>`](#function)

---

```
let myHash = { foo: 'bar' };

@myHash
func myFunc() {
    println(this <- decorator <- foo);
}

myFunc();
```

---

`decorator` starts with the prefix `@` and requires a [`hash`](#hash) value.

after that, a [`function`](#function) is required, anonymous functions cannot be used.

<br />

# Built-in functions

## import

```
import("./module/myLib");
```

> extends [`import`](#import)

## eval

```
eval("5 + 5"); // 10
```

<br />

Execute the provided code. The code can access the current environment variable.

`allowEval` must be `true`.

**this feature is a dangerous feature. be careful.**

## js

```
js("console.log('foo')");
```

`allowJavaScript` must be `true`.

**this feature is a dangerous feature. be careful.**

## convert

> extends [`string()`, `number()`, `boolean()`](#string-number-boolean)

## options

```
options(); // hash
```

Get project options. this cannot be modified.

<br />

# Standard library

<br />

## IO

### print

```
println("Hello, World!", 10);
```

Prints the provided value.

### println

```
println("Hello, World!");
```

Prints the provided value with a new line (`\n`).

## Utility

### length

```
length([1, 2, 3]); // 3

length("Hello, World!"); // 13
```

Gets the length of an array or string.

### match

```
println(match(3, [
    [ 1, func(v) { return value + 1; } ],
    [ 2, func(v) { return value + 2; } ]
], func(v) {
    println('nothing');
    return v * 10;
}));
```

### string, number, boolean

```
string(5); // "5"
number("5"); // 5
boolean(0); // false
```

### ternary

```
ternary(true, "foo", "bar"); // "foo"
ternary(false, "foo", "bar"); // "bar"
```

If the supplied value is true, the left parameter is returned, otherwise the right parameter is returned.

<br />

## Array

```
let arr = [1, 2, 3];
```

Arrays can contain values ​​of any type.

> extends [`array`](#array)

### push

```
push(array, 4); // [1, 2, 3, 4]
```

Adds the provided values ​​to an array.

Since this is a deep copy, `array` is not changed.

### pop

```
pop(array); // [1, 2]
```

Removes the last element of an array.

Since this is a deep copy, `array` is not changed.

### shift

```
shift(array); // [2, 3]
```

Removes the first element of an array.

Since this is a deep copy, `array` is not changed.

### unshift

```
unshift(array, 0); // [0, 1, 2, 3]
```

Adds the provided values ​​to the beginning of an array.

Since this is a deep copy, `array` is not changed.

### slice

```
slice(array, 1, 3); // [2, 3]
```

Divide `array` by the range of the two provided parameters.

Since this is a deep copy, `array` is not changed.

### join

```
join(array, ", "); // "1, 2, 3"
```

Adds `array` to the provided string.

Since this is a deep copy, `array` is not changed.

### forEach

```
forEach(array, func (value, index) {
    println(index, value);
});
```

Iterate through the `array`.

callback is given a value to traverse and an index value.

---

```
forEach(true, func (i) {
    if (i % 2 == 0) return true;

    if (i >= 10) return false;

    println(i);
});
```

`forEach` can be used as a `while` statement.

provide a true value instead of an array for the parameter, and the index value is provided in the callback.

### repeat

```
repeat(5); // [NULL, NULL, NULL, NULL, NULL]

repeat("foo", 3); // ["foo", "foo", "foo"]
```

If there is one parameter provided, iterates the null value by the number of provided values,

if there are two parameters, it iterates the first parameter by the second parameter.

<br />

## String

### split

```
split("foo bar baz", " "); // ["foo", "bar", "baz"]
```

Splits the supplied string into the second parameter.

### concat

```
concat("foo", "bar", "baz"); // "foobarbaz"
```

Combines the provided parameters.

### replace

```
replace("foo bar baz", " ", ", "); // "foo, bar, baz"
```

Replaces the value of the second parameter in the provided string with the value of the third parameter.

### subString

```
subString("foo bar baz", 4, 7); // "bar"
```

Divides a string by the number of parameters provided.

### rTest

```
rTest("[A-Z]", "ABCD"); // true
rTest("[A-Z]", "abcd"); // false
```

Checks if the supplied regular expression matches the second parameter.

### rMatch

```
rMatch("[A-Z]", "ABCD"); // ["A", "B", "C", "D"]
```

The supplied regular expression returns an array of matching values ​​in the second parameter.

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

Returns the type of the given expression.

<br />

```
typeof 10; // NUMBER
typeof 'foo'; // STRING
typeof true; // BOOLEAN
typeof {}; // HASH
typeof []; // ARRAY
typeof null; // NULL
typeof func() {}; // FUNCTION
```

## null

```
null; // NULL
```

## throw

```
<throw> <expr>
```

Throws an error in the provided expression.

<br />

```
throw 'Error'; // Error
```

## delete

```
<delete> <expr>
```

Deletes the provided key from environment variables.

<br />

```
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

Returns a value.

> extends [`<keywords>`](#keywords), [`<if>`](#if), [`<block expression>`](#block-expression)
