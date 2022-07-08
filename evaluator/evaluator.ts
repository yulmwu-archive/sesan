import builtinFunction from '../builtin';
import {
    BooleanObject,
    BuiltinFunction,
    Enviroment,
    HashObject,
    LangObject,
    NumberObject,
    ObjectKind,
    StringObject,
    newEnclosedEnvironment,
    objectKindStringify,
} from '../object';
import {
    ArrayExpression,
    BlockStatement,
    CallExpression,
    Expression,
    ExpressionKind,
    ExpressionStatement,
    FunctionExpression,
    HashExpression,
    HashPair,
    IfExpression,
    IndexExpression,
    InfixExpression,
    LiteralExpression,
    LiteralKind,
    modify_expression,
    NodeKind,
    PrefixExpression,
    Program,
    Statement,
    StringLiteral,
    WhileStatement,
} from '../parser';
import { TokenType } from '../tokenizer';
import { error } from '.';
import { Options } from '../options';

const NULL: LangObject = {
    kind: ObjectKind.NULL,
};

export default class Evaluator {
    public __builtin__arguments: Map<string, Array<LangObject>> = new Map();

    constructor(
        public p: Program,
        public env: Enviroment,
        public option: Options
    ) {}

    public eval(): LangObject {
        return this.evalStatements(this.p.statements, this.env, this.option);
    }

    private getFinalVal(objects: Array<LangObject>): LangObject {
        if (objects.length === 0) return NULL;
        return objects[objects.length - 1];
    }

    private evalStatements(
        statements: Array<Statement>,
        env: Enviroment,
        option: Options
    ): LangObject {
        let results: Array<LangObject> = [];

        statements.forEach((statement) => {
            const result = this.evalStatement(statement, env, option);

            results.push(result);

            if (result) {
                if (result.kind === ObjectKind.RETURN_VALUE) return result;
                if (result.kind === ObjectKind.ERROR) return result;
            }
        });

        return this.getFinalVal(results);
    }

    private evalBlockStatements(
        statements: Array<Statement>,
        env: Enviroment,
        option: Options
    ): LangObject {
        let results: Array<LangObject> = [];

        statements.forEach((statement) => {
            const result = this.evalStatement(statement, env, option);

            results.push(result);

            if (result) {
                if (result.kind === ObjectKind.RETURN_VALUE) return result;
                if (result.kind === ObjectKind.ERROR) return result;
            }
        });

        return this.getFinalVal(results);
    }

    private evalStatement(
        statement: Statement,
        env: Enviroment,
        option: Options
    ): LangObject {
        switch (statement.kind) {
            case NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, env, option);

            case NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, env, option);
                if (value?.kind === ObjectKind.ERROR) return value;

                const name = (statement.ident as unknown as StringLiteral)
                    .value;

                if (env.get(name))
                    return error(`identifier '${name}' already defined`);

                if (statement.ident) env.set(name, value);

                return null;
            }

            case NodeKind.AssignStatement: {
                const value = this.evalExpression(statement.value, env, option);

                if (value?.kind === ObjectKind.ERROR) return value;

                if (statement.ident)
                    env.update(
                        (statement.ident as unknown as StringLiteral).value,
                        value
                    );

                return null;
            }

            case NodeKind.ReturnStatement: {
                const expression = this.evalExpression(
                    (statement as unknown as ExpressionStatement).expression,
                    env,
                    option
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
                    env,
                    option
                );

                if (condition?.kind === ObjectKind.ERROR) return condition;

                const res: Array<LangObject> = [];

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression(
                        (statement as unknown as WhileStatement).body,
                        env,
                        option
                    );

                    if (result?.kind === ObjectKind.ERROR) return result;

                    condition = this.evalExpression(
                        (statement as unknown as WhileStatement).condition,
                        env,
                        option
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
        env: Enviroment,
        option: Options
    ): LangObject {
        if (!expression) return null;

        switch (expression.kind) {
            case ExpressionKind.Literal:
                return this.evalLiteral(
                    expression as LiteralExpression,
                    env,
                    option
                );

            case ExpressionKind.Prefix: {
                const expr = expression as unknown as PrefixExpression;
                return this.evalPrefix(expr.operator, expr.right, env, option);
            }
            case ExpressionKind.Infix:
                const infix = expression as unknown as InfixExpression;
                return this.evalInfix(
                    infix.operator,
                    infix.left,
                    infix.right,
                    env,
                    option
                );

            case ExpressionKind.Block:
                return this.evalBlockStatements(
                    (expression as unknown as BlockStatement).statements,
                    env,
                    option
                );

            case ExpressionKind.If: {
                const expr = expression as unknown as IfExpression;
                return this.evalIfExpression(
                    expr.condition,
                    expr.consequence,
                    expr.alternative,
                    env,
                    option
                );
            }

            case ExpressionKind.Ident:
                return this.evalIdent(
                    (expression as unknown as StringLiteral).value,
                    env,
                    option
                );

            case ExpressionKind.Function: {
                const expr = expression as unknown as FunctionExpression;
                return {
                    parameters: expr.arguments,
                    body: expr.body,
                    env,
                    option,
                    kind: ObjectKind.FUNCTION,
                };
            }

            case ExpressionKind.Call: {
                const expr = expression as unknown as CallExpression;

                const name = (expr.function as unknown as StringLiteral).value;

                if (name === 'quote')
                    return this.evalQuote(expr.arguments[0], env, option);

                const functionObject = this.evalExpression(
                    expr.function,
                    env,
                    option
                );

                const args = this.evalExpressions(expr.arguments, env, option);

                this.__builtin__arguments.set(name, args);

                if (args.length == 1 && args[0]?.kind === ObjectKind.ERROR)
                    return args[0];

                return this.applyFunction(
                    functionObject,
                    name,
                    args,
                    env,
                    option
                );
            }

            case ExpressionKind.Array: {
                const expr = expression as unknown as ArrayExpression;

                const args = this.evalExpressions(expr.elements, env, option);

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

                const _expr = this.evalExpression(expr.left, env, option);
                if (!_expr) return null;

                if (_expr.kind === ObjectKind.ERROR) return NULL;

                const index = this.evalExpression(expr.index, env, option);
                if (!index) return null;

                if (index.kind === ObjectKind.ERROR) return NULL;

                return this.evalIndex(_expr, index);
            }
            case ExpressionKind.Hash:
                return this.evalHashArguments(
                    (expression as unknown as HashExpression).pairs,
                    env,
                    option
                );

            default:
                return null;
        }
    }

    private evalQuote(
        expression: Expression,
        env: Enviroment,
        option: Options
    ): LangObject {
        return {
            value: this.evalUnquoteCalls(expression, env, option),
            kind: ObjectKind.QUOTE,
        };
    }

    private convertObjectToAst(object: LangObject): Expression {
        if (!object) return null;
        switch (object.kind) {
            case ObjectKind.NUMBER:
                return {
                    kind: ExpressionKind.Literal,
                    value: {
                        kind: LiteralKind.Number,
                        value: object.value,
                    },
                };

            case ObjectKind.BOOLEAN:
                return {
                    kind: ExpressionKind.Literal,
                    value: {
                        kind: LiteralKind.Boolean,
                        value: object.value,
                    },
                };

            case ObjectKind.QUOTE:
                return object.value;

            default:
                return {
                    kind: ExpressionKind.Literal,
                    value: {
                        kind: LiteralKind.Number,
                        value: 0,
                    },
                };
        }
    }

    private evalUnquoteCalls(
        quoted: Expression,
        env: Enviroment,
        option: Options
    ): Expression {
        const call = modify_expression(
            quoted,
            env,
            (expression: Expression, env: Enviroment): Expression => {
                if (!this.isUnqoteCall(expression)) return expression;

                if (expression?.kind === ExpressionKind.Call) {
                    const call = expression as unknown as CallExpression;
                    if (call.arguments.length !== 1) return expression;
                    return this.convertObjectToAst(
                        this.evalExpression(call.arguments[0], env, option)
                    );
                }

                return expression;
            }
        );
        if (!call) return quoted;

        return call;
    }

    private isUnqoteCall(expression: Expression): boolean {
        if (expression?.kind === ExpressionKind.Call) {
            const call = expression as unknown as CallExpression;

            if (call.function?.kind === ExpressionKind.Ident) {
                const ident = call.function as unknown as StringLiteral;

                return ident.value === 'unquote';
            }
        }
        return false;
    }

    private evalHashArguments(
        args: Array<HashPair>,
        env: Enviroment,
        option: Options
    ): HashObject {
        const hash: HashObject = {
            kind: ObjectKind.HASH,
            pairs: new Map(),
        };

        args.forEach((arg: HashPair) => {
            const key = this.evalExpression(arg.key, env, option);
            if (!key) return;

            const value = this.evalExpression(arg.value, env, option);
            if (!value) return;

            let key_: StringObject | NumberObject | BooleanObject = {
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
        env: Enviroment,
        option: Options
    ): Array<LangObject> {
        const ret: Array<LangObject> = [];

        expression.forEach((expr: Expression) => {
            const obj = this.evalExpression(expr, env, option);

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
        option: Options
    ): LangObject {
        if (name === '@') return NULL;

        if (func?.kind === ObjectKind.FUNCTION) {
            const res = this.evalExpression(
                (func as unknown as FunctionExpression).body,
                this.extendFunctionEnv(func, args, env, option),
                option
            );

            if (res?.kind === ObjectKind.RETURN_VALUE) return res.value;

            return res;
        }

        if (func?.kind === ObjectKind.BUILTIN)
            return (func as unknown as BuiltinFunction).func(
                args,
                env,
                option,
                this
            );

        return error(`'${name}' is not a function.`);
    }

    private extendFunctionEnv(
        func: LangObject,
        args: Array<LangObject>,
        env: Enviroment,
        option: Options
    ): Enviroment {
        if (func?.kind === ObjectKind.FUNCTION) {
            const newEnv = newEnclosedEnvironment(env);

            func.parameters.forEach((param: Expression, i: number) => {
                if (param?.kind === ExpressionKind.Ident) {
                    const ident = param as unknown as StringLiteral;
                    newEnv.set(ident.value, args[i]);
                }
            });

            return newEnv;
        }

        return new Enviroment();
    }

    private evalIdent(
        name: string,
        env: Enviroment,
        option: Options
    ): LangObject {
        if (env.get(name)) return env.get(name);

        return builtinFunction(name, env);
    }

    private evalLiteral(
        literal: LiteralExpression,
        env: Enviroment,
        option: Options
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
        option: Options
    ): LangObject {
        const expression = this.evalExpression(right, env, option);

        if (expression?.kind === ObjectKind.ERROR) return expression;

        switch (operator) {
            case TokenType.MINUS:
                return this.evalMinus(expression);

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
        option: Options
    ): LangObject {
        const left = this.evalExpression(_left, env, option);

        if (left?.kind === ObjectKind.ERROR) return left;

        const right = this.evalExpression(_right, env, option);

        if (right?.kind === ObjectKind.ERROR) return right;

        switch (left?.kind) {
            case ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, env, option);

            case ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, env, option);

            case ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(
                    operator,
                    left,
                    right,
                    env,
                    option
                );

            case ObjectKind.HASH:
                return this.evalHashInfix(operator, left, right, env, option);

            case ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, env, option);

            default:
                return error(`type missmatch [${left?.kind}] [${right?.kind}]`);
        }
    }

    private evalNumberInfix(
        operator: TokenType,
        left: LangObject,
        right: LangObject,
        env: Enviroment,
        option: Options
    ): LangObject {
        if (
            left?.kind !== ObjectKind.NUMBER ||
            right?.kind !== ObjectKind.NUMBER
        )
            return error(
                `type missmatch [${objectKindStringify(
                    left?.kind ?? ObjectKind.NULL
                )}] [${objectKindStringify(right?.kind ?? ObjectKind.NULL)}]`
            );

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
        option: Options
    ): LangObject {
        if (
            left?.kind !== ObjectKind.BOOLEAN ||
            right?.kind !== ObjectKind.BOOLEAN
        )
            return error(
                `type missmatch [${objectKindStringify(
                    left?.kind ?? ObjectKind.NULL
                )}] [${objectKindStringify(right?.kind ?? ObjectKind.NULL)}]`
            );

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
        option: Options
    ): LangObject {
        if (
            left?.kind !== ObjectKind.STRING ||
            right?.kind !== ObjectKind.STRING
        )
            return error(
                `type missmatch [${objectKindStringify(
                    left?.kind ?? ObjectKind.NULL
                )}] [${objectKindStringify(right?.kind ?? ObjectKind.NULL)}]`
            );

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
        option: Options
    ): LangObject {
        if (left?.kind !== ObjectKind.HASH || right?.kind !== ObjectKind.HASH)
            return error(
                `type missmatch [${objectKindStringify(
                    left?.kind ?? ObjectKind.NULL
                )}] [${objectKindStringify(right?.kind ?? ObjectKind.NULL)}]`
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
        option: Options
    ): LangObject {
        if (left?.kind !== ObjectKind.ARRAY || right?.kind !== ObjectKind.ARRAY)
            return error(
                `type missmatch [${objectKindStringify(
                    left?.kind ?? ObjectKind.NULL
                )}] [${objectKindStringify(right?.kind ?? ObjectKind.NULL)}]`
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

    private evalIfExpression(
        condition: Expression,
        consequence: Expression,
        alternative: Expression,
        env: Enviroment,
        option: Options
    ): LangObject {
        const conditionExpression = this.evalExpression(condition, env, option);

        if (conditionExpression?.kind === ObjectKind.ERROR)
            return conditionExpression;

        if (conditionExpression?.kind === ObjectKind.BOOLEAN) {
            if (conditionExpression.value) {
                return this.evalExpression(consequence, env, option);
            } else if (alternative) {
                return this.evalExpression(alternative, env, option);
            } else return NULL;
        }

        return NULL;
    }

    private evalIndex(left: LangObject, index: LangObject): LangObject {
        switch (left?.kind) {
            case ObjectKind.ARRAY:
                if (index?.kind === ObjectKind.NUMBER)
                    return this.evalArrayIndex(left, index);

                return error('type missmatch');

            case ObjectKind.HASH:
                let key: string | number;
                switch (index?.kind) {
                    case ObjectKind.STRING:
                    case ObjectKind.NUMBER:
                        key = index.value;
                        break;
                    default:
                        return error('type missmatch');
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

    private evalArrayIndex(left: LangObject, index: LangObject): LangObject {
        if (
            index?.kind !== ObjectKind.NUMBER ||
            left?.kind !== ObjectKind.ARRAY
        )
            return error('type missmatch');

        if (index.value < 0 || index.value >= left.value.length)
            return error('index out of range');

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

    private evalMinus(obj: LangObject): LangObject {
        if (obj?.kind !== ObjectKind.NUMBER) return error('type missmatch');

        return {
            kind: ObjectKind.NUMBER,
            value: -obj.value,
        };
    }
}

export { NULL };
