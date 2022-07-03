```
[Token + Lexer] (Tokenizer) -> Parser + AST (Abstract Syntax Tree) -> Evaluator -> [Repl]
```

---

```sh
npm i

npm run start # repl

export TEST=NAME
npm run test
```

<br>

# Expression

|           |         |            |
| --------- | ------- | ---------- |
| `Literal` | `Block` | `Prefix`   |
| `Infix`   | `If`    | `Function` |
| `Call`    | `Ident` | `Array`    |
| `Index`   | `Hash`  |            |

<br>

# Statement

|       |                       |          |         |
| ----- | --------------------- | -------- | ------- |
| `Let` | `ExpressionStatement` | `Return` | `Block` |

<br>

# Syntax

| keyword | Syntax                                                                   |
| ------- | ------------------------------------------------------------------------ |
| `let`   | `let [identifier] = [expression];`                                       |
| `if`    | `if ([condition]) [consequence (Block)] [alternative? (Block)];`         |
| `fn`    | `fn [identifier] ([parameters]) [body (Block) ([expression (return)])];` |

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

<br>

# Repl

![image](https://cdn.discordapp.com/attachments/959736817773609003/992993217467387984/unknown.png)

<br>

## Commands

> **prefix:** `#`

| Command | Description                      |
| ------- | -------------------------------- |
| `exit`  | Exit the repl                    |
| `mode`  | Change the mode ([#Mode](#Mode)) |

<br>

### Mode

| Mode          |                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `repl`        | [#Repl](#Repl)                                                                                                       |
| `parser`      | <img src="https://cdn.discordapp.com/attachments/959736817773609003/992994841015361586/unknown.png" width=300></img> |
| `parser json` | <img src="https://cdn.discordapp.com/attachments/959736817773609003/992994398235271199/unknown.png" width=300></img> |
| `lexer`       | <img src="https://cdn.discordapp.com/attachments/959736817773609003/992995609449607208/unknown.png" width=300></img> |
| `env`         | <img src="https://cdn.discordapp.com/attachments/959736817773609003/992995354687586394/unknown.png" width=300></img> |
