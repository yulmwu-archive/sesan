import { Enviroment } from '../object';
import {
    ArrayExpression,
    BlockStatement,
    Expression,
    ExpressionKind,
    FunctionExpression,
    HashExpression,
    HashPair,
    IfExpression,
    IndexExpression,
    InfixExpression,
    NodeKind,
    PrefixExpression,
    Program,
    Statement,
} from './types';

const modify = (
    program: Program,
    env: Enviroment,
    func: (expr: Expression, env: Enviroment) => Expression
): Program => {
    const statements: Array<Statement> = [];
    program.statements.forEach((statement) => {
        if (modify_statement(statement, env, func)) statements.push(statement);
        statements.push(statement);
    });
    program.statements = statements;
    return program;
};

const modify_statement = (
    statement: Statement,
    env: Enviroment,
    func: (expr: Expression, env: Enviroment) => Expression
): Statement | null => {
    switch (statement.kind) {
        case NodeKind.ExpressionStatement:
            return {
                kind: NodeKind.ExpressionStatement,
                expression: modify_expression(statement.expression, env, func),
            };
        case NodeKind.LetStatement: {
            return {
                kind: NodeKind.LetStatement,
                ident: statement.ident,
                value: modify_expression(statement.value, env, func),
            };
        }
        case NodeKind.ReturnStatement:
            return {
                kind: NodeKind.ReturnStatement,
                value: modify_expression(statement.value, env, func),
            };
        default:
            return null;
    }
};

const modify_expression = (
    expression: Expression,
    env: Enviroment,
    func: (expr: Expression, env: Enviroment) => Expression
): Expression => {
    if (!expression) return null;
    switch (expression.kind) {
        case ExpressionKind.Literal:
            return func(expression, env);
        case ExpressionKind.Infix: {
            const expr = expression as unknown as InfixExpression;
            return {
                kind: ExpressionKind.Infix,
                operator: expr.operator,
                left: modify_expression(expr.left, env, func),
                right: modify_expression(expr.right, env, func),
            };
        }
        case ExpressionKind.Prefix: {
            const expr = expression as unknown as PrefixExpression;
            return {
                kind: ExpressionKind.Prefix,
                operator: expr.operator,
                right: modify_expression(expr.right, env, func),
            };
        }
        case ExpressionKind.Index: {
            const expr = expression as unknown as IndexExpression;
            return {
                kind: ExpressionKind.Index,
                left: modify_expression(expr.left, env, func),
                index: modify_expression(expr.index, env, func),
            };
        }
        case ExpressionKind.If: {
            const expr = expression as unknown as IfExpression;
            return {
                kind: ExpressionKind.If,
                condition: modify_expression(expr.condition, env, func),
                consequence: modify_expression(expr.consequence, env, func),
                alternative: modify_expression(expr.alternative, env, func),
            };
        }
        case ExpressionKind.Block: {
            const expr = expression as unknown as BlockStatement;
            const statements: Array<Statement> = [];
            expr.statements.forEach((statement) => {
                if (modify_statement(statement, env, func))
                    statements.push(statement);
            });
            return {
                kind: ExpressionKind.Block,
                statements,
            };
        }
        case ExpressionKind.Function: {
            const expr = expression as unknown as FunctionExpression;
            const parameters: Array<Expression> = [];
            expr.arguments.forEach((parameter) => {
                parameters.push(modify_expression(parameter, env, func));
            });
            return {
                kind: ExpressionKind.Function,
                arguments: parameters,
                body: modify_expression(expr.body, env, func),
            };
        }
        case ExpressionKind.Array: {
            const expr = expression as unknown as ArrayExpression;
            const elements: Array<Expression> = [];
            expr.elements.forEach((element) => {
                elements.push(modify_expression(element, env, func));
            });
            return {
                kind: ExpressionKind.Array,
                elements,
            };
        }
        case ExpressionKind.Hash: {
            const expr = expression as unknown as HashExpression;
            const pairs: Array<HashPair> = [];
            expr.pairs.forEach((pair) => {
                pairs.push({
                    key: modify_expression(pair.key, env, func),
                    value: modify_expression(pair.value, env, func),
                });
            });
            return {
                kind: ExpressionKind.Hash,
                pairs,
            };
        }
        case ExpressionKind.Call:
            return func(expression, env);
        default:
            return expression;
    }
};

export { modify, modify_statement, modify_expression };
