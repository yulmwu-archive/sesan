```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator -> [Repl]
```

---

```sh
npm i

npm run start [file]
npm run start # start repl
```

<br>

---

> **Expression**
>
> `Literal`, `Block`, `Prefix`, `Infix`, `If`, `Function`, `Call`, `Ident`, `Array`, `Index`, `Hash`

<br>

> **Statement**
>
> `Let`, `Assign`, `ExpressionStatement`, `Return`, `Block`, `While`

<br>

> **Priority**
>
> `LOWEST`
>
> `EQUAL`
>
> `LESSGREATER`
>
> `SUM`
>
> `PRODUCT`
>
> `PREFIX`
>
> `CALL`
>
> `INDEX`

---

<br>

# Syntax

| Keyword               | Syntax                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| `let`                 | `let [identifier] = [expression];`                                         |
| assign (`=`)          | `[identifier] = [expression];`                                             |
| `if`                  | `if ([condition]) [consequence (Block)] [alternative? (Block)];`           |
| `func`                | `func [identifier] ([parameters]) [body (Block) ([expression (return)])];` |
| `call` (`func(args)`) | `[identifier]([arguments]);`                                               |
| `index` (`[]`)        | `[identifier][[expression]];`                                              |
| `while`               | `while ([condition]) [body (Block)];`                                      |
| comment               | `// [comment]`                                                             |

<br>

# Literal

| Type      | Syntax                                       |
| --------- | -------------------------------------------- |
| `string`  | `"string"`, `'string'`                       |
| `number`  | `[-?]Number.[Number?]`                       |
| `boolean` | `true`, `false`                              |
| `dict`    | `{ [key (string, number)]: [value (any)], }` |
| `array`   | `[value (any)]`                              |

<br>

# Operators

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

# Built-in Functions

| Function | Description     | Arguments                |
| -------- | --------------- | ------------------------ |
| `import` | Import a module | `[module_name (string)]` |
| `@`      | Ignore          | `[any]`                  |

<br>

# Repl

![image](https://cdn.discordapp.com/attachments/978977061878251565/993498532856201216/unknown.png)

<br>

## Commands

> **prefix:** `#`

| Command | Description     |
| ------- | --------------- |
| `exit`  | Exit the repl   |
| `mode`  | Change the mode |

---

> [**REPL**](#repl)

---

```
[REPL] 0 Env(s) ➜ #mode parser
Switched to 'parser' mode

[PARSER] 0 Env(s) ➜ let x = 10;
{
  statements: [
    {
      debug: 'parseLetStatement>return',
      ident: [Object],
      value: [Object],
      kind: 101
    }
  ]
}

[PARSER] 1 Env(s) ➜ _
```

---

```
[REPL] 0 Env(s) ➜ #mode parser json
Switched to 'parser_Json' mode

[PARSER_JSON] 0 Env(s) ➜ let x = 10;
{
  "statements": [
    {
      "debug": "parseLetStatement>return",
      "ident": {
        "debug": "parseLetStatement>ident",
        "value": "x",
        "kind": 7
      },
      "value": {
        "debug": "parsePrefix>case>number",
        "value": {
          "value": 10,
          "kind": 201
        },
        "kind": 0
      },
      "kind": 101
    }
  ]
}

[PARSER_JSON] 1 Env(s) ➜ _
```

---

```
[REPL] 0 Env(s) ➜ #mode lexer
Switched to 'lexer' mode

[LEXER] 0 Env(s) ➜ let a = 10;
[
  { type: 'LET', literal: 'let' },
  { type: 'IDENT', literal: 'a' },
  { type: '=', literal: '=' },
  { type: 'NUMBER', literal: '10' },
  { type: ';', literal: ';' }
]

[LEXER] 1 Env(s) ➜ _
```

---

```
[REPL] 0 Env(s) ➜ #mode env
Switched to 'env' mode

[ENV] 0 Env(s) ➜ let x = 10;
Enviroment {
  store: Map(1) { 'x' => { kind: 300, value: 10 } },
  outer: null
}

[ENV] 1 Env(s) ➜ let b = 20;
Enviroment {
  store: Map(2) {
    'x' => { kind: 300, value: 10 },
    'b' => { kind: 300, value: 20 }
  },
  outer: null
}

[ENV] 2 Env(s) ➜ _
```

<br>

# std

```ts
import('@std/[name]');
```

| Name    | path         |
| ------- | ------------ |
| `io`    | `@std/io`    |
| `array` | `@std/array` |
| `util`  | `@std/util`  |

# Todo List

-   [x] Tokenizer (Token + Lexer)
-   [x] Parser + AST (Abstract Syntax Tree)
-   [x] Evaluator
-   [x] REPL
