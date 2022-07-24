import {
    ArrayExpression,
    BlockStatement,
    CallExpression,
    Expression,
    ExpressionKind,
    FunctionExpression,
    HashExpression,
    HashPair,
    IfExpression,
    IndexExpression,
    InfixExpression,
    LiteralExpression,
    LiteralKind,
    NodeKind,
    PrefixExpression,
    Program,
    Statement,
    StringLiteral,
    WhileStatement,
    ReturnStatement,
    BooleanObject,
    BuiltinFunction,
    Enviroment,
    HashObject,
    LangObject,
    NumberObject,
    ObjectKind,
    StringObject,
    objectKindStringify,
    FunctionObject,
    TokenType,
    Options,
    error,
    Position,
    stderr,
    stdin,
    StdioOptions,
    stdout,
    builtinFunction,
    Decorator,
    errorFormatter,
    localization,
} from '../../index';

const NULL: LangObject = {
    kind: ObjectKind.NULL,
};

export default class Evaluator {
    public __builtin__arguments: Map<string, Array<LangObject>> = new Map();
    public __function__decorator: Decorator = null;
    public messages;

    constructor(
        public p: Program,
        public env: Enviroment,
        public option: Options,
        public stdio: StdioOptions = {
            stdin,
            stdout,
            stderr,
        },
        public filename: string,
        public root: string = './'
    ) {
        this.messages = localization(option);
    }

    public eval(): LangObject {
        if (this.p.errors.length > 0) return null;

        return this.evalStatements(this.p.statements, this.env);
    }

    private evalStatements(
        statements: Array<Statement>,
        env: Enviroment
    ): LangObject {
        let results: Array<LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, env);

            results.push(result);

            if (result) {
                if (result.kind === ObjectKind.RETURN_VALUE)
                    return result.value;
                if (result.kind === ObjectKind.ERROR) return result;
            }
        }

        if (results.length === 0) return NULL;

        return results[results.length - 1];
    }

    private evalBlockStatements(
        statements: Array<Statement>,
        env: Enviroment
    ): LangObject {
        let results: Array<LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, env);

            results.push(result);

            if (result) {
                if (result.kind === ObjectKind.RETURN_VALUE) return result;
                if (result.kind === ObjectKind.ERROR) return result;
            }
        }

        return NULL;
    }

    private evalStatement(statement: Statement, env: Enviroment): LangObject {
        switch (statement.kind) {
            case NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, env);

            case NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, env);
                if (value?.kind === ObjectKind.ERROR) return value;

                const name = (statement.ident as unknown as StringLiteral)
                    .value;

                if (statement.ident) env.set(name, value);

                return null;
            }

            case NodeKind.ReturnStatement: {
                const expression = this.evalExpression(
                    (statement as unknown as ReturnStatement).value,
                    env
                );

                if (expression)
                    return {
                        value: expression,
                        kind: ObjectKind.RETURN_VALUE,
                    };

                return NULL;
            }

            case NodeKind.WhileStatement: {
                let condition = this.evalExpression(
                    (statement as unknown as WhileStatement).condition,
                    env
                );

                if (condition?.kind === ObjectKind.ERROR) return condition;

                const res: Array<LangObject> = [];

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression(
                        (statement as unknown as WhileStatement).body,
                        env
                    );

                    if (result?.kind === ObjectKind.ERROR) return result;

                    condition = this.evalExpression(
                        (statement as unknown as WhileStatement).condition,
                        env
                    );

                    if (condition?.kind === ObjectKind.ERROR) return condition;

                    res.push(result);
                }

                return NULL;
            }

            default:
                return NULL;
        }
    }

    private evalExpression(
        expression: Expression,
        env: Enviroment
    ): LangObject {
        if (!expression) return null;

        switch (expression.kind) {
            case ExpressionKind.Literal:
                return this.evalLiteral(expression as LiteralExpression, env);

            case ExpressionKind.Prefix: {
                const expr = expression as unknown as PrefixExpression;

                return this.evalPrefix(expr.operator, expr.right, env, {
                    line: expr.line,
                    column: expr.column,
                });
            }

            case ExpressionKind.Infix:
                const infix = expression as unknown as InfixExpression;

                if (infix.operator === TokenType.ASSIGN)
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

            case ExpressionKind.Block:
                return this.evalBlockStatements(
                    (expression as unknown as BlockStatement).statements,
                    env
                );

            case ExpressionKind.If: {
                const expr = expression as unknown as IfExpression;
                return this.evalIfExpression(
                    expr.condition,
                    expr.consequence,
                    expr.alternative,
                    env
                );
            }

            case ExpressionKind.Ident:
                return this.evalIdent(
                    (expression as unknown as StringLiteral).value,
                    env,
                    {
                        line: expression.line,
                        column: expression.column,
                    }
                );

            case ExpressionKind.Function: {
                const expr = expression as unknown as FunctionExpression;

                const ret: LangObject = {
                    function: expr.function,
                    parameters: expr.arguments,
                    d:
                        this.__function__decorator?.disableCheckArguments ??
                        false,
                    body: expr.body,
                    env,
                    option: this.option,
                    kind: ObjectKind.FUNCTION,
                };

                if (expr.function)
                    env.set(
                        (expr.function as unknown as StringLiteral).value,
                        ret
                    );

                this.__function__decorator = null;

                return ret;
            }

            case ExpressionKind.Call: {
                const expr = expression as unknown as CallExpression;

                const name = (expr.function as unknown as StringLiteral).value;

                const functionObject = this.evalExpression(expr.function, env);

                const args = this.evalExpressions(expr.arguments, env);

                this.__builtin__arguments.set(name, args);

                if (args.length == 1 && args[0]?.kind === ObjectKind.ERROR)
                    return args[0];

                return this.applyFunction(functionObject, name, args, env, {
                    line: expression.line,
                    column: expression.column,
                });
            }

            case ExpressionKind.Array: {
                const expr = expression as unknown as ArrayExpression;

                const args = this.evalExpressions(expr.elements, env);

                if (args.length == 1 && args[0]?.kind === ObjectKind.ERROR)
                    return args[0];

                const _args: Array<LangObject> = [];

                args.forEach((arg: LangObject) => _args.push(arg));

                return {
                    value: _args,
                    kind: ObjectKind.ARRAY,
                };
            }

            case ExpressionKind.Index: {
                const expr = expression as unknown as IndexExpression;

                const _expr = this.evalExpression(expr.left, env);
                if (!_expr) return null;

                if (_expr.kind === ObjectKind.ERROR) return NULL;

                const index = this.evalExpression(expr.index, env);
                if (!index) return null;

                if (index.kind === ObjectKind.ERROR) return NULL;

                return this.evalIndex(_expr, index, {
                    line: expression.line,
                    column: expression.column,
                });
            }
            case ExpressionKind.Hash:
                return this.evalHashArguments(
                    (expression as unknown as HashExpression).pairs,
                    env
                );

            default:
                return null;
        }
    }

    private evalHashArguments(
        args: Array<HashPair>,
        env: Enviroment
    ): HashObject {
        const hash: HashObject = {
            kind: ObjectKind.HASH,
            pairs: new Map(),
        };

        args.forEach((arg: HashPair) => {
            const key = this.evalExpression(arg.key, env);
            if (!key) return;

            const value = this.evalExpression(arg.value, env);
            if (!value) return;

            let key_: StringObject | NumberObject = {
                kind: ObjectKind.STRING,
                value: '',
            };

            switch (key.kind) {
                case ObjectKind.NUMBER:
                    key_ = {
                        kind: ObjectKind.NUMBER,
                        value: key.value,
                    };
                    break;

                case ObjectKind.STRING:
                    key_ = {
                        kind: ObjectKind.STRING,
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
        expression: Array<Expression>,
        env: Enviroment
    ): Array<LangObject> {
        const ret: Array<LangObject> = [];

        expression.forEach((expr: Expression) => {
            const obj = this.evalExpression(expr, env);

            if (obj?.kind === ObjectKind.ERROR) {
                ret.push(obj);
                return;
            }

            ret.push(obj);
        });

        return ret;
    }

    public applyFunction(
        func: LangObject,
        name: string,
        args: Array<LangObject>,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (func?.kind === ObjectKind.FUNCTION) {
            const f = func as unknown as FunctionObject;

            if (!func.d && f.parameters.length !== args.length)
                return error(
                    errorFormatter(
                        this.messages.runtimeError.invalidArgument,
                        name,
                        f.parameters.length,
                        args.length
                    ),
                    pos.line,
                    pos.column
                );

            const res = this.evalExpression(
                f.body,
                this.extendFunctionEnv(func, args, env)
            );

            if (res?.kind === ObjectKind.RETURN_VALUE) return res.value;

            return res;
        }

        if (func?.kind === ObjectKind.BUILTIN)
            return (func as unknown as BuiltinFunction).func(
                args,
                env,
                this,
                pos
            );

        return error(
            errorFormatter(this.messages.runtimeError.invalidFunction, name),
            pos.line,
            pos.column
        );
    }

    private extendFunctionEnv(
        func: LangObject,
        args: Array<LangObject>,
        env: Enviroment
    ): Enviroment {
        if (func?.kind === ObjectKind.FUNCTION) {
            const newEnv = new Enviroment(env);

            func.parameters.forEach((param: Expression, i: number) => {
                if (param?.kind === ExpressionKind.Ident)
                    newEnv.set(
                        (param as unknown as StringLiteral).value,
                        args[i]
                    );
            });

            return newEnv;
        }

        return new Enviroment();
    }

    private evalIdent(
        name: string,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (env.get(name)) return env.get(name);

        const builtin = builtinFunction(name, env);
        if (!builtin)
            return error(
                errorFormatter(
                    this.messages.runtimeError.identifierNotDefined_2,
                    name
                ),
                pos.line,
                pos.column
            );

        return builtin;
    }

    private evalLiteral(
        literal: LiteralExpression,
        env: Enviroment
    ): LangObject {
        switch (literal.value.kind) {
            case LiteralKind.Number:
                return {
                    kind: ObjectKind.NUMBER,
                    value: literal.value.value,
                };

            case LiteralKind.String:
                return {
                    kind: ObjectKind.STRING,
                    value: literal.value.value,
                };

            case LiteralKind.Boolean:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: literal.value.value,
                };

            default:
                return NULL;
        }
    }

    private evalPrefix(
        operator: TokenType,
        right: Expression,
        env: Enviroment,
        pos: Position
    ): LangObject {
        const expression = this.evalExpression(right, env);

        if (expression?.kind === ObjectKind.ERROR) return expression;

        switch (operator) {
            case TokenType.MINUS:
                return this.evalMinus(expression, pos);

            case TokenType.BANG:
                return this.evalBang(expression);

            default:
                return NULL;
        }
    }

    private evalInfix(
        operator: TokenType,
        _left: Expression,
        _right: Expression,
        env: Enviroment,
        pos: Position
    ): LangObject {
        const left = this.evalExpression(_left, env);

        if (left?.kind === ObjectKind.ERROR) return left;

        const right = this.evalExpression(_right, env);

        if (right?.kind === ObjectKind.ERROR) return right;

        if (operator === TokenType.NULLISH)
            return left?.kind === ObjectKind.NULL ? right : left;

        switch (left?.kind) {
            case ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, env, pos);

            case ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, env, pos);

            case ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(operator, left, right, env, pos);

            case ObjectKind.HASH:
                return this.evalHashInfix(operator, left, right, env, pos);

            case ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, env, pos);

            default:
                return error(
                    errorFormatter(
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
        left: LangObject,
        right: LangObject,
        pos: Position
    ): LangObject {
        return error(
            errorFormatter(
                this.messages.runtimeError.typeMismatch_2,
                objectKindStringify(left?.kind ?? ObjectKind.NULL),
                objectKindStringify(left?.kind ?? ObjectKind.NULL)
            ),
            pos.line,
            pos.column
        );
    }

    private evalNumberInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (operator === TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== ObjectKind.NUMBER ||
            right?.kind !== ObjectKind.NUMBER
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case TokenType.PLUS:
                return {
                    kind: ObjectKind.NUMBER,
                    value: left.value + right.value,
                };

            case TokenType.MINUS:
                return {
                    kind: ObjectKind.NUMBER,
                    value: left.value - right.value,
                };

            case TokenType.SLASH:
                return {
                    kind: ObjectKind.NUMBER,
                    value: left.value / right.value,
                };

            case TokenType.ASTERISK:
                return {
                    kind: ObjectKind.NUMBER,
                    value: left.value * right.value,
                };

            case TokenType.PERCENT:
                return {
                    kind: ObjectKind.NUMBER,
                    value: left.value % right.value,
                };

            case TokenType.EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case TokenType.NOT_EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            case TokenType.GT:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value > right.value,
                };

            case TokenType.LT:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value < right.value,
                };

            case TokenType.GTE:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value >= right.value,
                };

            case TokenType.LTE:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value <= right.value,
                };

            default:
                return null;
        }
    }

    private evalBooleanInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (operator === TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== ObjectKind.BOOLEAN ||
            right?.kind !== ObjectKind.BOOLEAN
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case TokenType.EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case TokenType.NOT_EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            case TokenType.AND:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value && right.value,
                };

            case TokenType.OR:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value || right.value,
                };

            default:
                return null;
        }
    }

    private evalStringInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (operator === TokenType.IN)
            return this.evalInOperator(left, right, pos);

        if (
            left?.kind !== ObjectKind.STRING ||
            right?.kind !== ObjectKind.STRING
        )
            return this.typeMissmatch(left, right, pos);

        switch (operator) {
            case TokenType.PLUS:
                return {
                    kind: ObjectKind.STRING,
                    value: `${left.value}${right.value}`,
                };

            case TokenType.EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value === right.value,
                };

            case TokenType.NOT_EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: left.value !== right.value,
                };

            default:
                return null;
        }
    }

    private evalHashInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        pos: Position
    ): LangObject {
        switch (operator) {
            case TokenType.ELEMENT: {
                if (
                    right?.kind === ObjectKind.NUMBER ||
                    right?.kind === ObjectKind.STRING
                ) {
                    const newMap: Map<string | number, LangObject> = new Map();

                    (left as HashObject).pairs.forEach((value, key) =>
                        newMap.set(key.value, value)
                    );

                    return newMap.get(right.value) ?? NULL;
                } else return NULL;
            }

            case TokenType.IN:
                return this.evalInOperator(left, right, pos);
        }

        if (left?.kind !== ObjectKind.HASH || right?.kind !== ObjectKind.HASH)
            return error(
                errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    objectKindStringify(left?.kind ?? ObjectKind.NULL),
                    objectKindStringify(right?.kind ?? ObjectKind.NULL)
                ),
                pos.line,
                pos.column
            );

        switch (operator) {
            case TokenType.EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.pairs) ===
                        JSON.stringify(right.pairs),
                };

            case TokenType.NOT_EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.pairs) !==
                        JSON.stringify(right.pairs),
                };

            default:
                return null;
        }
    }

    private evalArrayInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        pos: Position
    ): LangObject {
        switch (operator) {
            case TokenType.ELEMENT:
                if (right?.kind === ObjectKind.NUMBER)
                    return this.evalIndex(left, right, pos);
                else NULL;

            case TokenType.IN:
                return this.evalInOperator(left, right, pos);
        }

        if (left?.kind !== ObjectKind.ARRAY || right?.kind !== ObjectKind.ARRAY)
            return error(
                errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    objectKindStringify(left?.kind ?? ObjectKind.NULL),
                    objectKindStringify(right?.kind ?? ObjectKind.NULL)
                ),
                pos.line,
                pos.column
            );

        switch (operator) {
            case TokenType.PLUS:
                return {
                    kind: ObjectKind.ARRAY,
                    value: [...left.value, ...right.value],
                };

            case TokenType.EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.value) ===
                        JSON.stringify(right.value),
                };

            case TokenType.NOT_EQUAL:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(left.value) !==
                        JSON.stringify(right.value),
                };

            default:
                return null;
        }
    }

    private evalIdentInfix(
        operator: TokenType,
        left: Expression,
        right: Expression,
        env: Enviroment,
        pos: Position
    ): LangObject {
        if (operator === TokenType.ASSIGN) {
            const _right = this.evalExpression(right, env);

            if (!env.get((left as unknown as StringLiteral).value))
                return error(
                    errorFormatter(
                        this.messages.runtimeError.identifierNotDefined_1,
                        (left as unknown as StringLiteral).value
                    ),
                    pos.line,
                    pos.column
                );

            env.update((left as unknown as StringLiteral).value, _right);

            return _right;
        }

        return null;
    }

    private evalInOperator(
        left: LangObject,
        right: LangObject,
        pos: Position
    ): LangObject {
        switch (right?.kind) {
            case ObjectKind.ARRAY:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: right.value
                        .map((x) => JSON.stringify(x))
                        .includes(JSON.stringify(left)),
                };

            case ObjectKind.HASH: {
                if (
                    left?.kind === ObjectKind.STRING ||
                    left?.kind === ObjectKind.NUMBER
                )
                    return {
                        kind: ObjectKind.BOOLEAN,
                        value: [...right.pairs.keys()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(left)),
                    };
                else return this.typeMissmatch(left, right, pos);
            }

            case ObjectKind.STRING:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: right.value.includes((left as StringObject).value),
                };

            case ObjectKind.NUMBER:
                if (left?.kind === ObjectKind.HASH)
                    return {
                        kind: ObjectKind.BOOLEAN,
                        value: [...left.pairs.values()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(right)),
                    };
                else return this.typeMissmatch(left, right, pos);

            default:
                return error(
                    errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        objectKindStringify(left?.kind ?? ObjectKind.NULL),
                        objectKindStringify(right?.kind ?? ObjectKind.NULL)
                    ),
                    pos.line,
                    pos.column
                );
        }
    }

    private evalIfExpression(
        condition: Expression,
        consequence: Expression,
        alternative: Expression,
        env: Enviroment
    ): LangObject {
        const conditionExpression = this.evalExpression(condition, env);

        if (conditionExpression?.kind === ObjectKind.ERROR)
            return conditionExpression;

        if (conditionExpression?.kind === ObjectKind.BOOLEAN) {
            if (conditionExpression.value)
                return this.evalExpression(consequence, env);
            else if (alternative) return this.evalExpression(alternative, env);
            else return NULL;
        }

        return NULL;
    }

    private evalIndex(
        left: LangObject,
        index: LangObject,
        pos: Position
    ): LangObject {
        switch (left?.kind) {
            case ObjectKind.ARRAY:
                if (index?.kind === ObjectKind.NUMBER)
                    return this.evalArrayIndex(left, index, pos);

                return error(
                    this.messages.runtimeError.typeMismatch_1,
                    pos.line,
                    pos.column
                );

            case ObjectKind.HASH:
                let key: string | number;
                switch (index?.kind) {
                    case ObjectKind.STRING:
                    case ObjectKind.NUMBER:
                        key = index.value;
                        break;
                    default:
                        return error(
                            this.messages.runtimeError.typeMismatch_1,
                            pos.line,
                            pos.column
                        );
                }

                const newMap: Map<string | number, LangObject> = new Map();

                left.pairs.forEach((value, key) =>
                    newMap.set(key.value, value)
                );

                return newMap.get(key) ?? NULL;

            default:
                return NULL;
        }
    }

    private evalArrayIndex(
        left: LangObject,
        index: LangObject,
        pos: Position
    ): LangObject {
        if (
            index?.kind !== ObjectKind.NUMBER ||
            left?.kind !== ObjectKind.ARRAY
        )
            return error(
                this.messages.runtimeError.typeMismatch_1,
                pos.line,
                pos.column
            );

        if (index.value < 0 || index.value >= left.value.length)
            return error(
                this.messages.runtimeError.indexOutOfRange,
                pos.line,
                pos.column
            );

        return left.value[index.value];
    }

    private isTruthy(obj: LangObject): boolean {
        if (!obj) return false;

        switch (obj.kind) {
            case ObjectKind.BOOLEAN:
                return obj.value;

            case ObjectKind.NUMBER:
                return obj.value !== 0;

            case ObjectKind.NULL:
                return false;

            default:
                return true;
        }
    }

    private evalBang(obj: LangObject): LangObject {
        return {
            kind: ObjectKind.BOOLEAN,
            value: !this.isTruthy(obj),
        };
    }

    private evalMinus(obj: LangObject, pos: Position): LangObject {
        if (obj?.kind !== ObjectKind.NUMBER)
            return error(
                this.messages.runtimeError.typeMismatch_1,
                pos.line,
                pos.column
            );

        return {
            kind: ObjectKind.NUMBER,
            value: -obj.value,
        };
    }
}

export { NULL };
