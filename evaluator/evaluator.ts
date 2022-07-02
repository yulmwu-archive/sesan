import { Enviroment, LangObject, ObjectKind } from '../object';
import {
    ArrayExpression,
    BlockStatement,
    CallExpression,
    Expression,
    ExpressionKind,
    ExpressionStatement,
    FunctionExpression,
    HashExpression,
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
} from '../parser';

const evalProgram = (program: Program, env: Enviroment): LangObject =>
    evalStatements(program.statements, env);

const getFinalVal = (objects: Array<LangObject>): LangObject => {
    if (objects.length === 0) return null;
    return objects[objects.length - 1];
};

const evalStatements = (
    statements: Array<Statement>,
    env: Enviroment
): LangObject => {
    let results: Array<LangObject> = [];

    statements.forEach((statement) => {
        const result = evalStatement(statement, env);

        results.push(result);

        if (result) {
            if (result.kind === ObjectKind.RETURN_VALUE) return result;
            if (result.kind === ObjectKind.ERROR) return result;
        }
    });

    return getFinalVal(results);
};

const evalBlockStatements = (
    statements: Array<Statement>,
    env: Enviroment
): LangObject => {
    let results: Array<LangObject> = [];

    statements.forEach((statement) => {
        const result = evalStatement(statement, env);

        results.push(result);

        if (result) {
            if (result.kind === ObjectKind.RETURN_VALUE) return result;
            if (result.kind === ObjectKind.ERROR) return result;
        }
    });

    return getFinalVal(results);
};

const evalStatement = (statement: Statement, env: Enviroment): LangObject => {
    switch (statement.kind) {
        case NodeKind.ExpressionStatement:
            return evalExpression(statement.expression, env);
        case NodeKind.LetStatement:
            const value = evalExpression(statement.value, env);
            if (value.kind === ObjectKind.ERROR) return value;
            if (statement.ident)
                env.set(
                    (statement.ident as unknown as StringLiteral).value,
                    value
                );
            return null;
        case NodeKind.ReturnStatement:
            const expression = evalExpression(
                (statement as unknown as ExpressionStatement).expression,
                env
            );
            if (expression)
                return {
                    value: expression,
                    kind: ObjectKind.RETURN_VALUE,
                };
            return null;
    }
};

const evalExpression = (
    expression: Expression,
    env: Enviroment
): LangObject => {
    switch (expression.kind) {
        case ExpressionKind.Literal:
            return evalLiteral((expression as LiteralExpression).value, env);
        case ExpressionKind.Prefix: {
            const expr = expression as unknown as PrefixExpression;
            return evalPrefix(expr.operator, expr.right, env);
        }
        case ExpressionKind.Infix:
            const infix = expression as unknown as InfixExpression;
            return evalInfix(infix.operator, infix.left, infix.right, env);
        case ExpressionKind.Block:
            return evalBlockStatements(
                (expression as unknown as BlockStatement).statements,
                env
            );
        case ExpressionKind.If: {
            const expr = expression as unknown as IfExpression;
            return evalIfExpression(
                expr.condition,
                expr.consequence,
                expr.alternative,
                env
            );
        }
        case ExpressionKind.Ident:
            return evalIdent(
                (expression as unknown as StringLiteral).value,
                env
            );
        case ExpressionKind.Function: {
            const expr = expression as unknown as FunctionExpression;
            return {
                parameters: expr.arguments,
                body: expr.body,
                env,
                kind: ObjectKind.FUNCTION,
            };
        }
        case ExpressionKind.Call: {
            const expr = expression as unknown as CallExpression;
            const name = (expr.function as unknown as StringLiteral).value;
            if (name === 'quote') return evalQuote(expr.arguments[0], env);
            const functionObject = evalExpression(
                expr.function,
                env
            ) as unknown as FunctionExpression;
            const args = evalExpressions(expr.arguments, env);
            if (args.length == 1 && args[0].kind === ObjectKind.ERROR)
                return args[0];
            return applyFunction(functionObject, args);
        }
        case ExpressionKind.Array: {
            const expr = expression as unknown as ArrayExpression;
            const args = evalExpressions(expr.elements, env);
            if (args.length == 1 && args[0].kind === ObjectKind.ERROR)
                return args[0];
            const _args: Array<LangObject> = [];
            args.forEach((arg: LangObject) => {
                _args.push(arg);
            });
            return {
                value: _args,
                kind: ObjectKind.ARRAY,
            };
        }
        case ExpressionKind.Index: {
            const expr = expression as unknown as IndexExpression;
            const _expr = evalExpression(expr.left, env);
            if (!_expr) return null;
            if (_expr.kind === ObjectKind.ERROR) return null;
            const index = evalExpression(expr.index, env);
            if (!index) return null;
            if (index.kind === ObjectKind.ERROR) return null;
            return evalIndex(_expr, index);
        }
        case ExpressionKind.Hash: {
            const expr = expression as unknown as HashExpression;
            return {
                pairs: evalHashArguments(expr.pairs, env),
                kind: ObjectKind.HASH,
            };
        }
    }
};

const evalQuote = (expression: Expression, env: Enviroment): LangObject => ({
    value: evalUnquoteCalls(expression, env),
    kind: ObjectKind.QUOTE,
});

const convertObjectToAst = (object: LangObject): Expression => {
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
};

const func = (expression: Expression, env: Enviroment): Expression => {
    if (!isUnqoteCall(expression)) return expression;
    if (expression?.kind === ExpressionKind.Call) {
        const call = expression as unknown as CallExpression;
        if (call.arguments.length !== 1) return expression;
        return convertObjectToAst(evalExpression(call.arguments[0], env));
    }
    return expression;
};

const evalUnquoteCalls = (quoted: Expression, env: Enviroment): Expression => {
    const call = ast
