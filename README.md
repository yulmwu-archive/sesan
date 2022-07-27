[English](./README.md) | [한국어](./README_KR.md)

[Docs](./docs/en_us/README.md) | [문서](./docs/ko_kr/README.md)

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
| `typeof`  | `object`  |
| `throw`   | `string`  |
| `delete`  | `string`  |
| `eval`    | `string`  |
| `js`      | `string`  |
| `convert` | `Any`     |
| `options` |           |
| `null`    |           |
| `self`    |           |

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
