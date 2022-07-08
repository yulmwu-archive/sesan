-   [**Introduce**](#Introduce)
    -   [How it works?](#how-it-works)
    -   [Start REPL](#start-repl)
        -   [REPL commands](#repl-commands)
        -   [REPL mode](#repl-mode)
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
-   [**Examples**](#Examples)
-   [**ToDo**](#Todo)

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
npm run start

# You can also from a file.
npm run start [file]
```

<br>

## REPL commands

> `#command args1 args2 args3`

| Command | Description     |
| ------- | --------------- |
| `exit`  | Exit the repl   |
| `mode`  | Change the mode |

<br>

## REPL mode

| Mode          | Description                  |
| ------------- | ---------------------------- |
| `repl`        | REPL mode                    |
| `lexer`       | Lexer mode                   |
| `parser`      | Parser mode                  |
| `parser json` | Parser mode with JSON output |
| `env`         | Environment mode             |

<br>

# Interpreter

## Tokens

| Token       | Identifier | Token       | Identifier |
| ----------- | ---------- | ----------- | ---------- |
| `EOF`       | `EOF`      | `ILLEGAL`   | `ILLEGAL`  |
| `NUMBER`    | `NUMBER`   | `IDENT`     | `IDENT`    |
| `TRUE`      | `TRUE`     | `STRING`    | `STRING`   |
| `FUNCTION`  | `FUNCTION` | `FALSE`     | `FALSE`    |
| `ASSIGN`    | `=`        | `COMMENT`   | `COMMENT`  |
| `MINUS`     | `-`        | `PLUS`      | `+`        |
| `ASTERISK`  | `*`        | `BANG`      | `!`        |
| `PERCENT`   | `%`        | `SLASH`     | `/`        |
| `GT`        | `>`        | `LT`        | `<`        |
| `NOT_EQUAL` | `!=`       | `EQUAL`     | `==`       |
| `COLON`     | `:`        | `COMMA`     | `,`        |
| `LPAREN`    | `(`        | `SEMICOLON` | `;`        |
| `LBRACE`    | `{`        | `RPAREN`    | `)`        |
| `LBRACKET`  | `[`        | `RBRACE`    | `}`        |
| `LET`       | `LET`      | `RBRACKET`  | `]`        |
| `ELSE`      | `ELSE`     | `IF`        | `IF`       |
| `WHILE`     | `WHILE`    | `RETURN`    | `RETURN`   |

<br>

## Expressions

| Expression | Syntax                              | Expression | Syntax                 |
| ---------- | ----------------------------------- | ---------- | ---------------------- |
| `Literal`  |                                     | `Block`    | `{ [expr] }`           |
| `If`       | `if ([expr]) [block] else [block];` | `Function` | `func([args]) [block]` |
| `Call`     | `[ident]([args])`                   | `Ident`    |                        |
| `Array`    | `[[expr], ...]`                     | `Index`    | `[ident][number]`      |
| `Hash`     | `{ string: expression, ... }`       | `Class`    | Todo                   |

<br>

## Statements

| Statement | Syntax                  | Statement             | Syntax                    |
| --------- | ----------------------- | --------------------- | ------------------------- |
| `Let`     | `let [ident] = [expr];` | `Assign`              | `[ident] = [expr];`       |
| `Return`  | `[expr]`                | `ExpressionStatement` | `[expr]`                  |
| `Block`   | `{ [statement] }`       | `While`               | `while ([expr]) [block];` |

<br>

## Priority

`LOWEST` > `EQUAL` > `LESSGREATER` > `SUM` > `PRODUCT` > `PREFIX` > `CALL` > `INDEX`

<br>

## Operators

| Operator | Syntax               | Literal Type                           |
| -------- | -------------------- | -------------------------------------- |
| `+`      | `Literal + Literal`  | `number`, `array`, `string`            |
| `-`      | `Literal - Literal`  | `number`                               |
| `*`      | `Literal * Literal`  | `number`                               |
| `/`      | `Literal / Literal`  | `number`                               |
| `%`      | `Literal % Literal`  | `number`                               |
| `==`     | `Literal == Literal` | `number, string, boolean, array, hash` |
| `!=`     | `Literal != Literal` | `number, string, boolean, array, hash` |
| `<`      | `Literal < Literal`  | `number`                               |
| `>`      | `Literal > Literal`  | `number`                               |

<br>

## Literal

| Type      | Syntax                                       |
| --------- | -------------------------------------------- |
| `string`  | `"String"`, `'String'`                       |
| `number`  | `[-?]Number.[Number?]`                       |
| `boolean` | `true`, `false`                              |
| `dict`    | `{ [key (String, Number)]: [value (Any)], }` |
| `array`   | `[value (Any)]`                              |

<br>

# Built-in functions

| Function | Arguments |
| -------- | --------- |
| `import` | `string`  |
| `typeof` | `object`  |
| `throw`  | `string`  |
| `delete` | `string`  |
| `update` | `string`  |

<br>

# Standard library

-   [**`@std/`**](https://github.com/tsukiroku/tiny/blob/main/@std/)
    -   [`lib`](https://github.com/tsukiroku/tiny/blob/main/@std/lib.tiny)
    -   [`io`](https://github.com/tsukiroku/tiny/blob/main/@std/io.tiny)
        -   `print`
        -   `println`
        -   `print_error`
        -   `println_error`
        -   `readline`
    -   [`array`](https://github.com/tsukiroku/tiny/blob/main/@std/array.tiny)
        -   `push`
        -   `pop`
        -   `shift`
        -   `unshift`
        -   `slice`
        -   `forEach`
    -   [`util`](https://github.com/tsukiroku/tiny/blob/main/@std/util.tiny)
        -   `length`

<br>

# Options

If `tiny.config.json` dose not exist in root (`./`), it extends Default.

| Option                   | Description                        | Default |
| ------------------------ | ---------------------------------- | ------- |
| `allowEval`              | Allow `eval()` feature             | `false` |
| `allowJavaScript`        | Allow `js()` feature               | `false` |
| `useStdLibAutomatically` | Use standard library automatically | `false` |

<br>

# Examples

> **tests**: [`./test`](https://github.com/tsukiroku/tiny/tree/main/tests)

-   [**`./examples`**](https://github.com/tsukiroku/tiny/tree/main/examples)
    -   [`Hello, World!`](https://github.com/tsukiroku/tiny/blob/main/examples/hello_world.tiny)
    -   [`fibonacci`](https://github.com/tsukiroku/tiny/blob/main/examples/fibonacci.tiny)

<br>

# Todo

-   [ ] Class
-   [ ] else if
-   [ ] More exception handling
-   [ ] Examples
