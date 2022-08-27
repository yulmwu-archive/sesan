`Sesan` Interpreter offical repository.

It can be used directly as a [Web Playground](#web-playground), and can be built according to the [build instructions](#start-repl).

---

-   [Introduce](#introduce)
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
-   [Npm package](#npm-package)
-   [Examples](#examples)
-   [Documentation](#documentation)
-   [Todo](#todo)

<br />

# Introduce

## Start REPL

### Download

```sh
git clone https://github.com/tsukiroku/sesan.git
cd sesan
```

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

[README](./web) | [Playground](https://tsukiroku.github.io/sesan)

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
| `Object`   | `{ string: expr, ... }`           | `Assign`   | `[ident / index] = expr`     |

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

| Operator | Syntax       | Literal Type                                              |
| -------- | ------------ | --------------------------------------------------------- |
| `+`      | `... + ...`  | `number`, `array`, `string`, `object`                     |
| `-`      | `... - ...`  | `number`                                                  |
| `*`      | `... * ...`  | `number`                                                  |
| `/`      | `... / ...`  | `number`                                                  |
| `%`      | `... % ...`  | `number`                                                  |
| `==`     | `... == ...` | `number, string, boolean, array, object`                  |
| `!=`     | `... != ...` | `number, string, boolean, array, object`                  |
| `<`      | `... < ...`  | `number`                                                  |
| `>`      | `... > ...`  | `number`                                                  |
| `<=`     | `... <= ...` | `number`                                                  |
| `>=`     | `... >= ...` | `number`                                                  |
| `<-`     | `... <- ...` | `array, object`, `Any`                                    |
| `.`      | extends `<-` | extends `<-`                                              |
| `??`     | `... ?? ...` | `Any`                                                     |
| `in`     | `... in ...` | `string, number, object`, `string, number, object, array` |

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

| Function           | Arguments |
| ------------------ | --------- |
| `import`           | `string`  |
| `eval`             | `string`  |
| `js`               | `string`  |
| `to_s`             | `Any`     |
| `to_n`             | `Any`     |
| `to_b`             | `Any`     |
| `to_a`             | `Any`     |
| `options`          |           |
| [`regExp`](#regex) |           |

<br />

# Standard library

-   [**`@std/`**](https://github.com/tsukiroku/sesan/blob/main/@std/)
    -   [`lib`](https://github.com/tsukiroku/sesan/blob/main/@std/lib.sesan)
    -   [`io`](https://github.com/tsukiroku/sesan/blob/main/@std/io.sesan)
        -   `print(args*) -> NULL`
        -   `println(args*) -> NULL`
    -   [`array`](https://github.com/tsukiroku/sesan/blob/main/@std/array.sesan)
        -   `push(array, value) -> array`
        -   `pop(array) -> array`
        -   `shift(array) -> array`
        -   `unshift(array, value) -> array`
        -   `slice(array, start, end) -> array`
        -   `join(array, separator) -> string`
        -   `forEach(array, callback) -> NULL`
            -   `callback(value, index)`
        -   `repeat(value, count) -> array`, `repeat(count) -> array`
        -   `reduce(array, callback, initial) -> Any`
            -   `callback(previous, current)`
        -   `map(array, callback) -> array`
            -   `callback(value, index)`
    -   [`util`](https://github.com/tsukiroku/sesan/blob/main/@std/util.sesan)
        -   `funcTools -> object`
        -   `length(array) -> number`
        -   `match(value, [pattern], default) -> Any`
        -   `ternary(condition, trueValue, falseValue) -> Any`
    -   [`string`]
        -   `split(string, separator) -> array`
        -   `concat(args*) -> string`
        -   `replace(string, pattern, replacement) -> string`
        -   `subString(string, start, end) -> string`
        -   `regExp(regexExpression, Options) -> string`
            -   `regexExpression`
                -   `pattern`: `[Regex Pattern]`
                -   `flags`: `[Regex Flags]`
            -   `Options`
                -   `type`: `match`, `test`, `replace`
                -   `str`: `string`
                -   `replace?`: `string`
        -   `regex(pattern, flags, string) -> function`
            -   `match() -> string`
            -   `test() -> boolean`
            -   `replace(string, replace) -> string`

<br />

# Options

If `sesan.config.json` dose not exist in root (`./`), it extends Default.

| Option                   | Description                        | Default |
| ------------------------ | ---------------------------------- | ------- |
| `allowEval`              | Allow `eval()` feature             | `false` |
| `allowJavaScript`        | Allow `js()` feature               | `false` |
| `useStdLibAutomatically` | Use standard library automatically | `false` |
| `stderrPrefix`           | Prefix for stderr                  | `true`  |
| `stderrColor`            | Color for stderr                   | `true`  |
| `locale`                 | Locale                             | `en`    |

<br />

# Npm package

> **Warning**
>
> Some features may not be updated immediately.
>
> when updating fatal errors, [npm package](#npm-package) is also updated immediately.

```sh
npm i @tsukiroku/sesan
```

```ts
import sesan, { NULL } from '@tsukiroku/sesan'

console.log(
    new sesan('let x = "World!"; println("Hello, " + x);', {
        useStdLibAutomatically: true,
    })
        .setBuiltins(new Map([['test', () => NULL]]))
        .applyBuiltins()
        .eval()
)
```

`@std/` must exist in root (`./`).

```sh
curl -O https://raw.githubusercontent.com/tsukiroku/sesan/main/scripts/dl-stds.sh && . ./dl-stds.sh && rm ./dl-stds.sh
```

<br />

# Examples

-   [**`./examples`**](https://github.com/tsukiroku/sesan/tree/main/examples)
    -   [`Hello, World!`](https://github.com/tsukiroku/sesan/blob/main/examples/hello_world.sesan)
    -   [`Fibonacci`](https://github.com/tsukiroku/sesan/blob/main/examples/fibonacci.sesan)
    -   [`Function`](https://github.com/tsukiroku/sesan/blob/main/examples/function.sesan)
    -   [`Object`](https://github.com/tsukiroku/sesan/blob/main/examples/object.sesan)
    -   [`If`](https://github.com/tsukiroku/sesan/blob/main/examples/if.sesan)
    -   [`While`](https://github.com/tsukiroku/sesan/blob/main/examples/while.sesan)
    -   [`Import`](https://github.com/tsukiroku/sesan/blob/main/examples/import.sesan)
    -   [`Variable`](https://github.com/tsukiroku/sesan/blob/main/examples/variable.sesan)
    -   [`Operators`](https://github.com/tsukiroku/sesan/blob/main/examples/operators.sesan)
    -   [`Built-in functions`](https://github.com/tsukiroku/sesan/blob/main/examples/builtin.sesan)
    -   [`Decorators`](https://github.com/tsukiroku/sesan/blob/main/examples/decorators.sesan)
    -   [`StdLib`](https://github.com/tsukiroku/sesan/blob/main/examples/stdlib)
        -   [`Array`](https://github.com/tsukiroku/sesan/blob/main/examples/stdlib/array.sesan)
        -   [`IO`](https://github.com/tsukiroku/sesan/blob/main/examples/stdlib/io.sesan)
        -   [`String`](https://github.com/tsukiroku/sesan/blob/main/examples/stdlib/string.sesan)
        -   [`Utility`](https://github.com/tsukiroku/sesan/blob/main/examples/stdlib/util.sesan)

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
        -   [object](#object)
        -   [function](#function)
        -   [null](#null)
        -   [undefined](#undefined)
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
        -   [reduce](#reduce)
        -   [map](#map)
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

### object

```
let object = {
    'foo': 'bar',
    bar: false,
    baz: [1, 2, 3],
    5: {
        x: func() {
            return 1;
        }
    }
}

object['foo']      // 'bar'
object.bar         // false
object <- 5 <- x() // 1

object <- qux      // UNDEFINED
```

---

Object is a pair of keys and values.

the key must be of type [`string`](#string) or [`number`](#number), and the value can be any type.

object pairs are can be accessed via the `index` or [`element`](#---operator) operator.

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

function names use `camelCase` or `snake_case` and, cannot use numbers as variable prefixes.

### null

```
null
```

### undefined

```
void <expression>
```

> extends [`<expression>`](#expression)

Returns `undefined` after executing the expression.

<br />

# Operators

```
<operator>: +, -, *, /, %, ==, !=, <, >, <=, >=, <-, ., ??, in

<left expression> <operator> <right expression>
```

> extends [`<expression>`](#expression)

---

## `+` (Plus) Operator

The `+` operator is addition, and can add [`number`](#number), [`string`](#string), [`array`](#array), [`object`](#object).

`number + number` : Add the right operand to the left operand.

`string + string` : Concatenate the right operand to the left operand.

`array + array` : Concatenate the right operand to the left operand.

`object + object` : Add the right operand to the left operand. if there are duplicate keys, the right operand is overwritten.

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

The `element` operator, which can access array or object elements.

```
[1, 2, 3] <- 1       // 2

[1, 2, 3].1          // 2

let object = {
    foo: {
        bar: 'baz'
    },
};

object <- foo <- bar   // 'baz'
object.foo.bar         // 'baz'

object['foo']['bar'] = 'qux';
```

Cannot reassign values ​​with the `element` operator, must use `index`.

<br />

# Control flow

## If

```
if <condition expression [boolean]> <block expression>
else <block expression>

if <condition expression [boolean]> <expression> else <expression>
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

if `.sesan` is not included in path, `.sesan` will be added automatically.

<br />

# Decorator

```
@<object>
<function> // func <identifier>(<arguments>) <block expression>;
```

> extends [`<object>`](#object), [`<function>`](#function)

---

```
let myObject = { foo: 'bar' };

@myObject
func myFunc() {
    println(this <- decorator <- foo);
}

myFunc();
```

---

`decorator` starts with the prefix `@` and requires a [`object`](#object) value.

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

## options

```
options(); // object
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

### to_s, to_n, to_b, to_a

```
to_s(1); // '1'
to_n('1'); // 1
to_b(1); // true
to_a({ foo: 'bar', bar: 1 }); // ['bar', 1]
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
    if (i % 2 == 0) { return true };

    if (i >= 10) { return false };

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

### reduce

```
reduce([ 1, 2, 3 ], func (prev, curr) prev + curr, 0);
```

Iterates through each element of the provided array, accumulating the return value of the callback and returning it.

can specify the initial value of the accumulated values.

### map

```
map([1, 2, 3], func (x, _) x * 10);
```

Iterates through each element of the provided array, returning a new array with the return value of the callback.

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

### regex

```
let pattern = regex('[a-z]', 'g', 'asdf');

println(pattern <- match());
println(pattern <- test());
println(pattern <- replace('b'));
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

<keywords> implement();
```

> extends [`<keywords>`](#keywords), [`<if>`](#if)

IIFE (Immediately Invoked Function Expression) pattern

```
(func () {
    implement();
})();
```

# Statement

```
<let>, <return>, <while>, <block expression>, <expression statement>
```

> extends [`<let>`](#variables), [`<return>`](./return), [`<while>`](#while), [`<block expression>`](#block-expression), [`<expression statement>`](#expression)

# Keywords

```
<let>, <func>, <true>, <false>, <if>, <else>, <return>, <while>, <in>, <typeof>, <null>, <throw>, <delete>, <use>, <void>, <expr>

Not used, but may be added later

<class>, <for>, <const>
```

> extends [`<let>`](#variables), [`<func>`](#function), [`<true>`](#boolean), [`<false>`](#boolean), [`<if>`](#if), [`<else>`](#if), [`<return>`](#return), [`<while>`](#while), [`<in>`](#operators-1), [`<use>`](#import-1), [`<void>`](#undefined), [`<expr>`](#expr-keyword)

---

## typeof

```
<typeof> <expr>
```

Returns the type of the given expression.

<br />

```
typeof 10; // number
typeof 'foo'; // string
typeof true; // boolean
typeof {}; // object
typeof []; // array
typeof null; // null
typeof func() {}; // function
typeof void 0; // undefined
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

## expr keyword

```
expr <expression>
```

> extends [`expression`](#expression)

Evaluates the expression, and if the result is an error,

```
{
    'message': 'error message',
    'filename': 'file name',
    'line': 0,       // line number
    'column': 0,     // column number
    'error': true    // true if error
}
```

an Object containing the error message is returned.

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

<br />

# Return

```
<keywords> {
    implement();

    return null;
} // `NULL`

<if> null; // `NULL`
```

Returns a value.

> extends [`<keywords>`](#keywords), [`<if>`](#if), [`<block expression>`](#block-expression)

<br>

# Todo

> **Warning**
>
> This plan is subject to change at any time.

## Syntax

-   `switch` (`match`) expression
    -   `[switch|match] <expr> { ...<case>, <default|_>: body }`
        -   `case`
            -   `<expr>: body`
-   `const` statement
    -   `const <identifier> = <expr>;`
-   `class` statement
    -   `class <identifier> { ...<method> }`
        -   `method`
            -   `<identifier> ( ...<parameter> ) <body>`
-   `for` statement
    -   `for (<identifier> [in|of] <expr>) <body>`
        -   `of`
            -   `<expr> of <expr>`
-   Bitwise operators
    -   `<expr> & <expr>`
    -   `<expr> | <expr>`
    -   `<expr> ^ <expr>`
    -   `<expr> << <expr>`
    -   `<expr> >> <expr>`
    -   `<expr> >>> <expr>`
-   Power operator
    -   `<expr> ** <expr>`

## Features

-   Compiling to JavaScript
    -   Supporting `ES6` syntax
-   CLI, Repl refectoring

<br>

# Contributing

Contributions are free, but please follow the [`guidelines`] below.

###
