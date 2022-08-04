import { readFileSync } from 'node:fs';
import * as Tiny from '../../index';

const NULL: Tiny.LangObject = {
    kind: Tiny.ObjectKind.NULL,
};

export default class Evaluator {
    public messages;
    public exportEnviroment: Tiny.Enviroment | null = null;

    constructor(
        public p: Tiny.Program,
        public env: Tiny.Enviroment,
        public option: Tiny.Options,
        public stdio: Tiny.StdioOptions = {
            stdin: Tiny.stdin,
            stdout: Tiny.stdout,
            stderr: Tiny.stderr,
        },
        public filename: string,
        public root: string = './'
    ) {
        this.messages = Tiny.localization(option);
    }

    public eval(): Tiny.LangObject {
        if (this.p.errors.length > 0) return null;

        return this.evalStatements(this.p.statements, this.env);
    }

    private evalStatements(
        statements: Array<Tiny.Statement>,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        let results: Array<Tiny.LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, env);

            results.push(result);

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE)
                    return result.value;
                if (result.kind === Tiny.ObjectKind.ERROR) return result;
            }
        }

        if (results.length === 0) return NULL;

        return results[results.length - 1];
    }

    private evalBlockStatements(
        statement: Tiny.BlockStatement,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        const { statements, returnFinal } = statement;

        let results: Array<Tiny.LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, env);

            results.push(result);

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE) return result;
                if (result.kind === Tiny.ObjectKind.ERROR) return result;
            }
        }

        if (results.length === 0) return NULL;

        if (returnFinal) return results[results.length - 1];
        else return NULL;
    }

    private evalStatement(
        statement: Tiny.Statement,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        switch (statement.kind) {
            case Tiny.NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, env);

            case Tiny.NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, env);
                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                const name = (statement.ident as unknown as Tiny.StringLiteral)
                    .value;

                if (statement.ident) {
                    if (
                        env.has(name) &&
                        !name.startsWith('_') &&
                        this.option.strictMode
                    )
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError
                                    .identifierAlreadyDefined,
                                name
                            ),
                            statement.line,
                            statement.column
                        );
                    env.set(name, value);
                }

                return null;
            }

            case Tiny.NodeKind.ReturnStatement: {
                const expression = this.evalExpression(
                    (statement as unknown as Tiny.ReturnStatement).value,
                    env
                );

                if (expression)
                    return {
                        value: expression,
                        kind: Tiny.ObjectKind.RETURN_VALUE,
                    };

                return NULL;
            }

            case Tiny.NodeKind.WhileStatement: {
                let condition = this.evalExpression(
                    (statement as unknown as Tiny.WhileStatement).condition,
                    env
                );

                if (condition?.kind === Tiny.ObjectKind.ERROR) return condition;

                const res: Array<Tiny.LangObject> = [];

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression(
                        (statement as unknown as Tiny.WhileStatement).body,
                        env
                    );

                    if (result?.kind === Tiny.ObjectKind.ERROR) return result;

                    condition = this.evalExpression(
                        (statement as unknown as Tiny.WhileStatement).condition,
                        env
                    );

                    if (condition?.kind === Tiny.ObjectKind.ERROR)
                        return condition;

                    res.push(result);
                }

                return NULL;
            }

            case Tiny.NodeKind.DecoratorStatement: {
                const decorator =
                    statement as unknown as Tiny.DecoratorStatement;

                const value = this.evalExpression(decorator.value, env);

                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                const func = this.evalFunction(
                    decorator.function as Tiny.FunctionExpression,
                    env,
                    value
                );

                if (func?.kind !== Tiny.ObjectKind.FUNCTION) return null;

                return func;
            }

            default:
                return NULL;
        }
    }

    private evalExpression(
        expression: Tiny.Expression,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        if (!expression) return null;

        switch (expression.kind) {
            case Tiny.ExpressionKind.Literal:
                return this.evalLiteral(expression as Tiny.LiteralExpression);

            case Tiny.ExpressionKind.Prefix: {
                const expr = expression as unknown as Tiny.PrefixExpression;

                return this.evalPrefix(expr.operator, expr.right, env, {
                    line: expr.line,
                    column: expr.column,
                });
            }

            case Tiny.ExpressionKind.Infix:
                const infix = expression as unknown as Tiny.InfixExpression;

                switch (infix.operator) {
                    case Tiny.TokenType.ASSIGN:
                        return this.evalIdentInfix(
                            infix.operator,
                            infix.left,
                            infix.right,
                            env,
                            {
                                line: infix.line,
                                column: infix.column,
                            }
                        );

                    case Tiny.TokenType.ELEMENT:
                        return this.evalElementInfix(
                            infix.left,
                            infix.right,
                            env,
                            {
                                line: infix.line,
                                column: infix.column,
                            }
                        );
                }

                return this.evalInfix(
                    infix.operator,
                    infix.left,
                    infix.right,
                    env,
                    {
                        line: infix.line,
                        column: infix.column,
                    }
                );

            case Tiny.ExpressionKind.Block:
                return this.evalBlockStatements(
                    expression as unknown as Tiny.BlockStatement,
                    env
                );

            case Tiny.ExpressionKind.If: {
                const expr = expression as unknown as Tiny.IfExpression;

                return this.evalIfExpression(
                    expr.condition,
                    expr.consequence,
                    expr.alternative,
                    env
                );
            }

            case Tiny.ExpressionKind.Ident:
                return this.evalIdent(
                    (expression as unknown as Tiny.StringLiteral).value,
                    env,
                    {
                        line: expression.line,
                        column: expression.column,
                    }
                );

            case Tiny.ExpressionKind.Function:
                return this.evalFunction(
                    expression as unknown as Tiny.FunctionExpression,
                    env
                );

            case Tiny.ExpressionKind.Call:
                return this.evalCallExpression(
                    expression as unknown as Tiny.CallExpression,
                    env
                );

            case Tiny.ExpressionKind.Array: {
                const expr = expression as unknown as Tiny.ArrayExpression;

                const args = this.evalExpressions(expr.elements, env);

                if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR)
                    return args[0];

                const _args: Array<Tiny.LangObject> = [];

                args.forEach((arg: Tiny.LangObject) => _args.push(arg));

                return {
                    value: _args,
                    kind: Tiny.ObjectKind.ARRAY,
                };
            }

            case Tiny.ExpressionKind.Index: {
                const expr = expression as unknown as Tiny.IndexExpression;

                const _expr = this.evalExpression(expr.left, env);
                if (!_expr) return null;

                if (_expr.kind === Tiny.ObjectKind.ERROR) return NULL;

                const index = this.evalExpression(expr.index, env);
                if (!index) return null;

                if (index.kind === Tiny.ObjectKind.ERROR) return NULL;

                return this.evalIndex(_expr, index, {
                    line: expression.line,
                    column: expression.column,
                });
            }

            case Tiny.ExpressionKind.Hash:
                return this.evalHashArguments(
                    (expression as unknown as Tiny.HashExpression).pairs,
                    env
                );

            case Tiny.ExpressionKind.Typeof: {
                const expr = expression as unknown as Tiny.TypeofExpression;

                const value = this.evalExpression(expr.value, env);

                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                if (!value) return NULL;

                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: Tiny.objectKindStringify(value.kind),
                };
            }

            case Tiny.ExpressionKind.Throw: {
                const expr = expression as unknown as Tiny.ThrowExpression;

                const message = this.evalExpression(expr.message, env);

                if (message?.kind === Tiny.ObjectKind.ERROR) return message;

                if (!message) return NULL;

                return Tiny.error(
                    Tiny.objectStringify(message),
                    expr.line,
                    expr.column
                );
            }

            case Tiny.ExpressionKind.Delete: {
                const expr = expression as unknown as Tiny.DeleteExpression;

                if (expr.value?.kind !== Tiny.ExpressionKind.Ident)
                    return Tiny.error(
                        this.messages.runtimeError.deleteRequiresIdentifier,
                        expr.line,
                        expr.column
                    );

                env.delete((expr.value as unknown as Tiny.StringLiteral).value);

                return NULL;
            }

            case Tiny.ExpressionKind.Use: {
                const expr = expression as unknown as Tiny.UseExpression;

                const path = this.evalExpression(expr.path, env);

                if (path?.kind === Tiny.ObjectKind.ERROR) return path;

                if (path?.kind !== Tiny.ObjectKind.STRING)
                    return Tiny.error(
                        this.messages.runtimeError.useRequiresString,
                        expr.line,
                        expr.column
                    );

                return this.importEnv(
                    (path as unknown as Tiny.StringObject).value,
                    env,
                    this,
                    {
                        line: expr.line,
                        column: expr.column,
                    }
                );
            }

            default:
                return null;
        }
    }

    public importEnv(
        path: string,
        env: Tiny.Enviroment,
        t: Evaluator,
        pos: Tiny.Position
    ): Tiny.LangObject {
        try {
            if (!path.endsWith('.tiny')) path += '.tiny';

            const parsed = new Tiny.Parser(
                new Tiny.Lexer(
                    readFileSync(`${t.root}${path}`, 'utf8'),
                    {
                        ...t.option,
                        stderr: t.stdio.stderr,
                    },
                    path
                ),
                t.option
            ).parseProgram();

            parsed.errors.forEach((error) =>
                Tiny.printError(error, path, t.stdio.stderr, {
                    ...t.option,
                })
            );

            return new Tiny.Evaluator(
                parsed,
                env,
                t.option,
                t.stdio,
                t.root
            ).eval();
        } catch (e) {
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: `Could not import file: ${t.root}${path}`,
                ...pos,
            };
        }
    }

    private evalFunction(
        expression: Tiny.FunctionExpression,
        env: Tiny.Enviroment,
        decorator?: Tiny.LangObject
    ): Tiny.LangObject {
        const expr = expression as unknown as Tiny.FunctionExpression;

        const ret: Tiny.LangObject = {
            function: expr.function ?? null,
            parameters: expr.arguments,
            body: expr.body,
            env,
            option: this.option,
            decorator: decorator as Tiny.HashObject,
            kind: Tiny.ObjectKind.FUNCTION,
        };

        const name = ret.function
            ? (ret.function as unknown as Tiny.StringLiteral).value ?? null
            : null;

        if (expr.function && name)
            if (
                env.has(name) &&
                !name.startsWith('_') &&
                this.option.strictMode
            )
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.functionAlreadyDefined,
                        name
                    ),
                    expr.line,
                    expr.column
                );
            else env.set(name, ret);

        return ret;
    }

    private evalCallExpression(
        expression: Tiny.CallExpression,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        const expr = expression as unknown as Tiny.CallExpression;

        const name = (expr.function as unknown as Tiny.StringLiteral).value;

        const functionObject = this.evalExpression(expr.function, env);

        if (functionObject?.kind === Tiny.ObjectKind.ERROR)
            return functionObject;

        const args = this.evalExpressions(expr.arguments, env);

        if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR)
            return args[0];

        return this.applyFunction(
            functionObject,
            name,
            args,
            env,
            {
                line: expression.line,
                column: expression.column,
            },
            {
                kind: Tiny.ObjectKind.HASH,
                pairs: new Map<
                    Tiny.StringObject | Tiny.NumberObject,
                    Tiny.LangObject
                >([
                    [
                        {
                            kind: Tiny.ObjectKind.STRING,
                            value: 'arguments',
                        },
                        {
                            kind: Tiny.ObjectKind.ARRAY,
                            value: args,
                        },
                    ],
                    [
                        {
                            kind: Tiny.ObjectKind.STRING,
                            value: 'decorator',
                        },
                        (functionObject as Tiny.FunctionObject).decorator ??
                            NULL,
                    ],
                ]),
            }
        );
    }

    private evalHashArguments(
        args: Array<Tiny.HashPair>,
        env: Tiny.Enviroment
    ): Tiny.HashObject {
        const hash: Tiny.HashObject = {
            kind: Tiny.ObjectKind.HASH,
            pairs: new Map(),
        };

        args.forEach((arg: Tiny.HashPair) => {
            const key = this.evalExpression(arg.key, env);
            if (!key) return;

            if (key.kind === Tiny.ObjectKind.ERROR) return key;

            const value = this.evalExpression(arg.value, env);
            if (!value) return;

            if (value.kind === Tiny.ObjectKind.ERROR) return key;

            let key_: Tiny.StringObject | Tiny.NumberObject = {
                kind: Tiny.ObjectKind.STRING,
                value: '',
            };

            switch (key.kind) {
                case Tiny.ObjectKind.NUMBER:
                    key_ = {
                        kind: Tiny.ObjectKind.NUMBER,
                        value: key.value,
                    };
                    break;

                case Tiny.ObjectKind.STRING:
                    key_ = {
                        kind: Tiny.ObjectKind.STRING,
                        value: key.value,
                    };
                    break;

                default:
                    return;
            }

            if (key) hash.pairs.set(key_, value);
        });

        return hash;
    }

    private evalExpressions(
        expression: Array<Tiny.Expression>,
        env: Tiny.Enviroment
    ): Array<Tiny.LangObject> {
        const ret: Array<Tiny.LangObject> = [];

        expression.forEach((expr: Tiny.Expression) => {
            const obj = this.evalExpression(expr, env);

            if (obj?.kind === Tiny.ObjectKind.ERROR) {
                ret.push(obj);
                return;
            }

            ret.push(obj);
        });

        return ret;
    }

    private getDecorator(
        key: string | number,
        func: Tiny.FunctionObject
    ): Tiny.LangObject | null {
        if (!func.decorator) return null;

        return (
            new Map(
                [...func.decorator.pairs].map(([key, value]) => [
                    key.value,
                    value,
                ])
            ).get(key) ?? NULL
        );
    }

    public applyFunction(
        _func: Tiny.LangObject,
        name: string,
        args: Array<Tiny.LangObject>,
        env: Tiny.Enviroment,
        pos: Tiny.Position,
        thisObject: Tiny.LangObject
    ): Tiny.LangObject {
        const func = _func as Tiny.FunctionObject;

        if (func?.kind === Tiny.ObjectKind.FUNCTION) {
            if (
                !this.getDecorator('skipCheckArguments', func) &&
                func.parameters.length !== args.length
            )
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidArgument,
                        name,
                        func.parameters.length,
                        args.length
                    ),
                    pos.line,
                    pos.column
                );

            const res = this.evalExpression(
                func.body,
                this.extendFunctionEnv(
                    func,
                    args,
                    env,
                    thisObject,
                    this.getDecorator('capture', func)
                        ? (
                              this.getDecorator(
                                  'capture',
                                  func
                              ) as Tiny.BooleanObject
                          ).value
                        : false
                )
            );

            if (res?.kind === Tiny.ObjectKind.RETURN_VALUE) return res.value;

            if (res?.kind === Tiny.ObjectKind.ERROR) return res;

            return res;
        }

        if (func?.kind === Tiny.ObjectKind.BUILTIN)
            return (func as unknown as Tiny.BuiltinFunction).func(
                args,
                env,
                this,
                pos
            );

        return Tiny.error(
            Tiny.errorFormatter(
                this.messages.runtimeError.invalidFunction,
                name
            ),
            pos.line,
            pos.column
        );
    }

    private extendFunctionEnv(
        func: Tiny.LangObject,
        args: Array<Tiny.LangObject>,
        env: Tiny.Enviroment,
        thisObject: Tiny.LangObject,
        capture: boolean
    ): Tiny.Enviroment {
        if (func?.kind === Tiny.ObjectKind.FUNCTION) {
            let newEnv = new Tiny.Enviroment(env);

            if (capture) newEnv = func.env;

            func.parameters.forEach((param: Tiny.Expression, i: number) => {
                if (param?.kind === Tiny.ExpressionKind.Ident)
                    newEnv.set(
                        (param as unknown as Tiny.StringLiteral).value,
                        args[i]
                    );
            });

            newEnv.set('this', thisObject);

            return newEnv;
        }

        return new Tiny.Enviroment();
    }

    private evalIdent(
        name: string,
        env: Tiny.Enviroment,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (env.get(name)) return env.get(name);

        const builtin = Tiny.builtinFunction(name, env);

        if (!builtin)
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.identifierNotDefined_2,
                    name
                ),
                pos.line,
                pos.column
            );

        return builtin;
    }

    private evalLiteral(literal: Tiny.LiteralExpression): Tiny.LangObject {
        switch (literal.value.kind) {
            case Tiny.LiteralKind.Number:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: literal.value.value,
                };

            case Tiny.LiteralKind.String:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: literal.value.value,
                };

            case Tiny.LiteralKind.Boolean:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: literal.value.value,
                };

            default:
                return NULL;
        }
    }

    private evalPrefix(
        operator: Tiny.TokenType,
        right: Tiny.Expression,
        env: Tiny.Enviroment,
        pos: Tiny.Position
    ): Tiny.LangObject {
        const expression = this.evalExpression(right, env);

        if (expression?.kind === Tiny.ObjectKind.ERROR) return expression;

        switch (operator) {
            case Tiny.TokenType.MINUS:
                return this.evalMinus(expression, pos);

            case Tiny.TokenType.BANG:
                return this.evalBang(expression);

            default:
                return NULL;
        }
    }

    private evalInfix(
        operator: Tiny.TokenType,
        _left: Tiny.Expression,
        _right: Tiny.Expression,
        env: Tiny.Enviroment,
        pos: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(_left, env);

        if (left?.kind === Tiny.ObjectKind.ERROR) return left;

        const right = this.evalExpression(_right, env);

        if (right?.kind === Tiny.ObjectKind.ERROR) return right;

        if (operator === Tiny.TokenType.NULLISH)
            return left?.kind === Tiny.ObjectKind.NULL ? right : left;

        switch (left?.kind) {
            case Tiny.ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, pos);

            case Tiny.ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, pos);

            case Tiny.ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(operator, left, right, pos);

            case Tiny.ObjectKind.HASH:
                return this.evalHashInfix(operator, left, right, pos);

            case Tiny.ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, pos);

            default:
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        left?.kind,
                        right?.kind
                    ),
                    pos.line,
                    pos.column
                );
        }
    }

    private typeMissmatch(
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        return Tiny.error(
            Tiny.errorFormatter(
                this.messages.runtimeError.typeMismatch_2,
                Tiny.objectKindStringify(left?.kind ?? Tiny.ObjectKind.NULL),
                Tiny.objectKindStringify(right?.kind ?? Tiny.ObjectKind.NULL)
            ),
            pos.line,
            pos.column
        );
    }

    private evalNumberInfix(
        operator: Tiny.TokenType,
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== Tiny.ObjectKind.NUMBER ||
            right?.kind !== Tiny.ObjectKind.NUMBER
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: left.value + right.value,
                };

            case Tiny.TokenType.MINUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: left.value - right.value,
                };

            case Tiny.TokenType.SLASH:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: left.value / right.value,
                };

            case Tiny.TokenType.ASTERISK:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: left.value * right.value,
                };

            case Tiny.TokenType.PERCENT:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: left.value % right.value,
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            case Tiny.TokenType.GT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value > right.value,
                };

            case Tiny.TokenType.LT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value < right.value,
                };

            case Tiny.TokenType.GTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value >= right.value,
                };

            case Tiny.TokenType.LTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value <= right.value,
                };

            default:
                return null;
        }
    }

    private evalBooleanInfix(
        operator: Tiny.TokenType,
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== Tiny.ObjectKind.BOOLEAN ||
            right?.kind !== Tiny.ObjectKind.BOOLEAN
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            case Tiny.TokenType.AND:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value && right.value,
                };

            case Tiny.TokenType.OR:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value || right.value,
                };

            default:
                return null;
        }
    }

    private evalStringInfix(
        operator: Tiny.TokenType,
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== Tiny.ObjectKind.STRING ||
            right?.kind !== Tiny.ObjectKind.STRING
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: `${left.value}${right.value}`,
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            default:
                return null;
        }
    }

    private evalHashInfix(
        operator: Tiny.TokenType,
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        switch (operator) {
            case Tiny.TokenType.IN:
                return this.evalInOperator(left, right, pos);
        }

        if (
            left?.kind !== Tiny.ObjectKind.HASH ||
            right?.kind !== Tiny.ObjectKind.HASH
        )
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(
                        left?.kind ?? Tiny.ObjectKind.NULL
                    ),
                    Tiny.objectKindStringify(
                        right?.kind ?? Tiny.ObjectKind.NULL
                    )
                ),
                pos.line,
                pos.column
            );

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.pairs) ===
                        JSON.stringify(right.pairs),
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.pairs) !==
                        JSON.stringify(right.pairs),
                };

            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.HASH,
                    pairs: new Map([
                        ...[...left.pairs.entries()].filter(
                            ([k]) =>
                                !new Map(
                                    [...right.pairs.entries()].map(([k, v]) => [
                                        JSON.stringify(k),
                                        v,
                                    ])
                                ).has(JSON.stringify(k))
                        ),
                        ...right.pairs,
                    ]),
                };

            default:
                return null;
        }
    }

    private evalArrayInfix(
        operator: Tiny.TokenType,
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        switch (operator) {
            case Tiny.TokenType.IN:
                return this.evalInOperator(left, right, pos);
        }

        if (
            left?.kind !== Tiny.ObjectKind.ARRAY ||
            right?.kind !== Tiny.ObjectKind.ARRAY
        )
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(
                        left?.kind ?? Tiny.ObjectKind.NULL
                    ),
                    Tiny.objectKindStringify(
                        right?.kind ?? Tiny.ObjectKind.NULL
                    )
                ),
                pos.line,
                pos.column
            );

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.ARRAY,
                    value: [...left.value, ...right.value],
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.value) ===
                        JSON.stringify(right.value),
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.value) !==
                        JSON.stringify(right.value),
                };

            default:
                return null;
        }
    }

    private evalIdentInfix(
        operator: Tiny.TokenType,
        left: Tiny.Expression,
        right: Tiny.Expression,
        env: Tiny.Enviroment,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.ASSIGN) {
            const _right = this.evalExpression(right, env);

            if (_right?.kind === Tiny.ObjectKind.ERROR) return _right;

            if (
                left?.kind !== Tiny.ExpressionKind.Ident &&
                left?.kind !== Tiny.ExpressionKind.Index
            )
                return Tiny.error(
                    this.messages.runtimeError.typeMismatch_1,
                    pos.line,
                    pos.column
                );

            switch (left.kind) {
                case Tiny.ExpressionKind.Ident: {
                    if (!env.get((left as unknown as Tiny.StringLiteral).value))
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError
                                    .identifierNotDefined_1,
                                (left as unknown as Tiny.StringLiteral).value
                            ),
                            pos.line,
                            pos.column
                        );

                    env.update(
                        (left as unknown as Tiny.StringLiteral).value,
                        _right
                    );

                    return _right;
                }

                case Tiny.ExpressionKind.Index: {
                    const index = (left as unknown as Tiny.IndexExpression)
                        .index;

                    const _left = this.evalExpression(
                        (left as unknown as Tiny.IndexExpression).left,
                        env
                    );

                    if (_left?.kind === Tiny.ObjectKind.ERROR) return _left;

                    if (
                        _left?.kind !== Tiny.ObjectKind.ARRAY &&
                        _left?.kind !== Tiny.ObjectKind.HASH
                    )
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError.typeMismatch_2,
                                Tiny.objectKindStringify(
                                    _left?.kind ?? Tiny.ObjectKind.NULL
                                ),
                                Tiny.objectKindStringify(Tiny.ObjectKind.ARRAY)
                            ),
                            pos.line,
                            pos.column
                        );

                    if (_left?.kind === Tiny.ObjectKind.ARRAY) {
                        const _index = this.evalExpression(index, env);

                        if (_index?.kind === Tiny.ObjectKind.ERROR)
                            return _index;

                        if (_index?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_1,
                                pos.line,
                                pos.column
                            );

                        const _value = this.evalExpression(right, env);

                        if (_value?.kind === Tiny.ObjectKind.ERROR)
                            return _value;

                        if (_value?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_2,
                                pos.line,
                                pos.column
                            );

                        (_left as unknown as Tiny.ArrayObject).value[
                            _index.value
                        ] = _value;

                        return _value;
                    } else {
                        const _index = this.evalExpression(index, env);

                        if (_index?.kind === Tiny.ObjectKind.ERROR)
                            return _index;

                        if (
                            _index?.kind !== Tiny.ObjectKind.STRING &&
                            _index?.kind !== Tiny.ObjectKind.NUMBER
                        )
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_1,
                                pos.line,
                                pos.column
                            );

                        const _value = this.evalExpression(right, env);

                        if (_value?.kind === Tiny.ObjectKind.ERROR)
                            return _value;

                        _left.pairs = new Map(
                            Array.from(
                                new Map([
                                    ...new Map(
                                        [..._left.pairs].map(([k, v]) => [
                                            k.value,
                                            v,
                                        ])
                                    ),
                                    [_index.value, _value],
                                ]).entries()
                            ).map(([k, v]) => [
                                typeof k === 'string'
                                    ? {
                                          value: k,
                                          kind: Tiny.ObjectKind.STRING,
                                      }
                                    : {
                                          value: k,
                                          kind: Tiny.ObjectKind.NUMBER,
                                      },
                                v,
                            ])
                        );

                        return _value;
                    }
                }
            }
        }

        return null;
    }

    private evalElementInfix(
        _left: Tiny.Expression,
        _right: Tiny.Expression,
        env: Tiny.Enviroment,
        pos: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(_left, env);

        if (left?.kind === Tiny.ObjectKind.ERROR) return left;

        if (
            left?.kind !== Tiny.ObjectKind.HASH &&
            left?.kind !== Tiny.ObjectKind.ARRAY
        )
            return null;

        let right: Tiny.LangObject | Tiny.CallExpression = null;

        if (_right?.kind === Tiny.ExpressionKind.Ident)
            right = {
                kind: Tiny.ObjectKind.STRING,
                value: _right.value,
            };
        else if (_right?.kind === Tiny.ExpressionKind.Call) right = _right;
        else right = this.evalExpression(_right, env);

        if (right?.kind === Tiny.ObjectKind.ERROR) return right;

        if (left.kind === Tiny.ObjectKind.ARRAY)
            if (right?.kind === Tiny.ObjectKind.NUMBER)
                return this.evalIndex(left, right, pos);
            else NULL;

        if (
            right?.kind === Tiny.ObjectKind.NUMBER ||
            right?.kind === Tiny.ObjectKind.STRING
        ) {
            return (
                new Map(
                    [...(left as Tiny.HashObject).pairs].map(([key, value]) => [
                        key.value,
                        value,
                    ])
                ).get(right.value) ?? NULL
            );
        } else if (right?.kind === Tiny.ExpressionKind.Call) {
            const expr =
                new Map(
                    [...(left as Tiny.HashObject).pairs].map(([key, value]) => [
                        key.value,
                        value,
                    ])
                ).get(
                    (right.function as unknown as Tiny.StringLiteral).value
                ) ?? NULL;

            if (expr?.kind === Tiny.ObjectKind.ERROR) return expr;

            if (expr?.kind !== Tiny.ObjectKind.FUNCTION)
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidFunction,
                        (right.function as unknown as Tiny.StringLiteral).value
                    ),
                    pos.line,
                    pos.column
                );

            return this.evalCallExpression(
                {
                    kind: Tiny.ExpressionKind.Call,
                    function: {
                        kind: Tiny.ExpressionKind.Function,
                        function: expr.function,
                        arguments: expr.parameters,
                        body: expr.body,
                        ...pos,
                    },
                    arguments: right.arguments,
                    ...pos,
                },
                env
            );
        } else return NULL;
    }

    private evalInOperator(
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        switch (right?.kind) {
            case Tiny.ObjectKind.ARRAY:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: right.value
                        .map((x) => JSON.stringify(x))
                        .includes(JSON.stringify(left)),
                };

            case Tiny.ObjectKind.HASH: {
                if (
                    left?.kind === Tiny.ObjectKind.STRING ||
                    left?.kind === Tiny.ObjectKind.NUMBER
                )
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...right.pairs.keys()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(left)),
                    };
                else return this.typeMissmatch(left, right, pos);
            }

            case Tiny.ObjectKind.STRING:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: right.value.includes(
                        (left as Tiny.StringObject).value
                    ),
                };

            case Tiny.ObjectKind.NUMBER:
                if (left?.kind === Tiny.ObjectKind.HASH)
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...left.pairs.values()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(right)),
                    };
                else return this.typeMissmatch(left, right, pos);

            default:
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        Tiny.objectKindStringify(
                            left?.kind ?? Tiny.ObjectKind.NULL
                        ),
                        Tiny.objectKindStringify(
                            right?.kind ?? Tiny.ObjectKind.NULL
                        )
                    ),
                    pos.line,
                    pos.column
                );
        }
    }

    private evalIfExpression(
        condition: Tiny.Expression,
        consequence: Tiny.Expression,
        alternative: Tiny.Expression,
        env: Tiny.Enviroment
    ): Tiny.LangObject {
        const conditionExpression = this.evalExpression(condition, env);

        if (conditionExpression?.kind === Tiny.ObjectKind.ERROR)
            return conditionExpression;

        if (conditionExpression?.kind === Tiny.ObjectKind.BOOLEAN) {
            if (conditionExpression.value)
                return this.evalExpression(consequence, env);
            else if (alternative) return this.evalExpression(alternative, env);
            else return NULL;
        }

        return NULL;
    }

    private evalIndex(
        left: Tiny.LangObject,
        index: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        switch (left?.kind) {
            case Tiny.ObjectKind.ARRAY: {
                if (index?.kind === Tiny.ObjectKind.NUMBER)
                    return this.evalArrayIndex(left, index, pos);

                return Tiny.error(
                    this.messages.runtimeError.typeMismatch_1,
                    pos.line,
                    pos.column
                );
            }

            case Tiny.ObjectKind.HASH: {
                let key: string | number;

                switch (index?.kind) {
                    case Tiny.ObjectKind.STRING:
                    case Tiny.ObjectKind.NUMBER:
                        key = index.value;
                        break;

                    default:
                        return Tiny.error(
                            this.messages.runtimeError.typeMismatch_1,
                            pos.line,
                            pos.column
                        );
                }

                return (
                    new Map(
                        [...left.pairs].map(([key, value]) => [
                            key.value,
                            value,
                        ])
                    ).get(key) ?? NULL
                );
            }

            default:
                return NULL;
        }
    }

    private evalArrayIndex(
        left: Tiny.LangObject,
        index: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (
            index?.kind !== Tiny.ObjectKind.NUMBER ||
            left?.kind !== Tiny.ObjectKind.ARRAY
        )
            return Tiny.error(
                this.messages.runtimeError.typeMismatch_1,
                pos.line,
                pos.column
            );

        if (index.value < 0 || index.value >= left.value.length)
            return Tiny.error(
                this.messages.runtimeError.indexOutOfRange,
                pos.line,
                pos.column
            );

        return left.value[index.value];
    }

    private isTruthy(obj: Tiny.LangObject): boolean {
        if (!obj) return false;

        switch (obj.kind) {
            case Tiny.ObjectKind.BOOLEAN:
                return obj.value;

            case Tiny.ObjectKind.NUMBER:
                return obj.value !== 0;

            case Tiny.ObjectKind.NULL:
                return false;

            default:
                return true;
        }
    }

    private evalBang(obj: Tiny.LangObject): Tiny.LangObject {
        return {
            kind: Tiny.ObjectKind.BOOLEAN,
            value: !this.isTruthy(obj),
        };
    }

    private evalMinus(
        obj: Tiny.LangObject,
        pos: Tiny.Position
    ): Tiny.LangObject {
        if (obj?.kind !== Tiny.ObjectKind.NUMBER)
            return Tiny.error(
                this.messages.runtimeError.typeMismatch_1,
                pos.line,
                pos.column
            );

        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: -obj.value,
        };
    }
}

export { NULL };
