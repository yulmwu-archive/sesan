# 인터프리터

## 구조

```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator
```

<br>

# Expression

|           |         |            |
| --------- | ------- | ---------- |
| `Literal` | `Block` | `Prefix`   |
| `Infix`   | `If`    | `Function` |
| `Call`    | `Ident` | `Array`    |
| `Index`   | `Hash`  | `null`     |

<br>

# Statement

|       |                       |          |         |
| ----- | --------------------- | -------- | ------- |
| `Let` | `ExpressionStatement` | `Return` | `Block` |

> 위 항목을 제외하고, 모두 `Expression`으로 간주함

<br>

# Syntax

| keyword  | Syntax                                        |
| -------- | --------------------------------------------- |
| `let`    | `let [identifier] = [expression]`             |
| `return` | `return [expression]`                         |
| `if`     | `if [condition] [consequence] [alternative?]` |

<br>

# Literal

| type      | syntax                                    |
| --------- | ----------------------------------------- |
| `string`  | `"string"`                                |
| `number`  | `[-?]Number`                              |
| `boolean` | `true`, `false`                           |
| `dict`    | `{ [key (string, number)]: [value (*)] }` |

<br>

# Built-in Functions

| Function | Description | Arguments |
| -------- | ----------- | --------- |
| `print`  | print       | `*`       |

`...more`
