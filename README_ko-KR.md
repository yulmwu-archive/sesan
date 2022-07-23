[English](./README.md) | [한국어](./README_ko-KR.md)

---

-   [**소개**](#소개)
    -   [작동 원리](#작동-원리)
    -   [REPL](#REPL)
        -   [REPL 명령어](#REPL-명령어)
        -   [REPL 모드](#REPL-모드)
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

| 명령어 | 설명           |
| ------ | -------------- |
| `exit` | REPL 종료      |
| `mode` | REPL 모드 변경 |

<br>

## REPL 모드

| Mode          | Description             |
| ------------- | ----------------------- |
| `repl`        | REPL 모드               |
| `lexer`       | Lexer 모드              |
| `parser`      | Parser 모드             |
| `parser json` | Parser 모드 (JSON 출력) |
| `env`         | 환경 변수 모드          |

<br>

# 웹 Playground

[여기](https://tsukiroku.github.io/tiny)를 클릭하여 웹 Playground을 실행할 수 있습니다.

<br>

# 인터프리터

## 토큰 (Token)

| 토큰        | 식별자     | 토큰        | 식별자    |
| ----------- | ---------- | ----------- | --------- |
| `EOF`       | `EOF`      | `ILLEGAL`   | `ILLEGAL` |
| `NUMBER`    | `NUMBER`   | `IDENT`     | `IDENT`   |
| `TRUE`      | `TRUE`     | `STRING`    | `STRING`  |
| `FUNCTION`  | `FUNCTION` | `FALSE`     | `FALSE`   |
| `ASSIGN`    | `=`        | `COMMENT`   | `COMMENT` |
| `MINUS`     | `-`        | `PLUS`      | `+`       |
| `ASTERISK`  | `*`        | `BANG`      | `!`       |
| `PERCENT`   | `%`        | `SLASH`     | `/`       |
| `GT`        | `>`        | `LT`        | `<`       |
| `NOT_EQUAL` | `!=`       | `EQUAL`     | `==`      |
| `COLON`     | `:`        | `COMMA`     | `,`       |
| `LPAREN`    | `(`        | `SEMICOLON` | `;`       |
| `LBRACE`    | `{`        | `RPAREN`    | `)`       |
| `LBRACKET`  | `[`        | `RBRACE`    | `}`       |
| `LET`       | `LET`      | `RBRACKET`  | `]`       |
| `ELSE`      | `ELSE`     | `IF`        | `IF`      |
| `WHILE`     | `WHILE`    | `RETURN`    | `RETURN`  |

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
| `+`    | `Literal + Literal`  | `number`, `array`, `string`                           |
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
| `typeof`  | `object`  |
| `throw`   | `string`  |
| `delete`  | `string`  |
| `eval`    | `string`  |
| `js`      | `string`  |
| `convert` | `Any`     |
| `null`    |           |

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
        -   `forEach(array, callback)`
        -   `repeat(value, count)`, `repeat(count)`
    -   [`util`](https://github.com/tsukiroku/tiny/blob/main/@std/util.tiny)
        -   `length(array)`
        -   `match(value, [pattern], default)`
        -   `string(value)`
        -   `number(value)`
        -   `boolean(value)`

<br>

# 옵션

If `tiny.config.json` dose not exist in root (`./`), it extends Default.

| Option                   | Description                            | Default |
| ------------------------ | -------------------------------------- | ------- |
| `allowEval`              | `eval()` 기능을 활성화합니다.          | `false` |
| `allowJavaScript`        | Allow `js()` 기능을 활성화합니다.      | `false` |
| `useStdLibAutomatically` | 자동으로 표준 라이브러리를 가져옵니다. | `false` |
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
