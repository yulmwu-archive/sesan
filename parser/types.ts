import { TokenType } from '../tokenizer';

interface Program {
    statements: Array<Statement>;
}

type Statement =
    | LetStatement
    | ReturnStatement
    | ExpressionStatement
    | BlockStatement;

type Expression =
    | LiteralExpression
    | BlockStatement
    | PrefixExpression
    | InfixExpression
    | IfExpression
    | FunctionExpression
    | CallExpression
    | IdentExpression
    | ArrayExpression
    | IndexExpression
    | HashExpression
    | null;

interface LetStatement {
    ident: Expression;
    value: Expression;
}

interface ReturnStatement {
    value: Expression;
}

interface ExpressionStatement {
    expression: Expression;
}

interface LiteralExpression {
    value: NumberLiteral | StringLiteral | BooleanLiteral;
}

interface BlockStatement {
    statements: Array<Statement>;
}

interface PrefixExpression {
    operator: TokenType;
    right: Expression;
}

interface InfixExpression {
    left: Expression;
    right: Expression;
    operator: TokenType;
}

interface IfExpression {
    condition: Expression;
    consequence: Expression;
    alternative: Expression | null;
}

interface FunctionExpression {
    arguments: Array<Expression>;
    body: Statement;
}

interface CallExpression {
    function: Expression;
    arguments: Array<Expression>;
}

interface ArrayExpression {
    elements: Array<Expression>;
}

interface IndexExpression {
    left: Expression;
    index: Expression;
}

interface IdentExpression {
    value: string;
}

interface HashExpression {
    pairs: Array<HashPair>;
}

interface HashPair {
    key: Expression;
    value: Expression;
}

interface NumberLiteral {
    value: number;
}

interface StringLiteral {
    value: string;
}

interface BooleanLiteral {
    value: boolean;
}

export {
    Program,
    Statement,
    Expression,
    LetStatement,
    ReturnStatement,
    ExpressionStatement,
    LiteralExpression,
    BlockStatement,
    PrefixExpression,
    InfixExpression,
    IfExpression,
    FunctionExpression,
    CallExpression,
    ArrayExpression,
    IndexExpression,
    IdentExpression,
    HashExpression,
    HashPair,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
};
