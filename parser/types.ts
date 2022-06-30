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
    | null | 0;

interface Debug {
    debug: string;
}

interface LetStatement extends Debug {
    ident: Expression;
    value: Expression;
}

interface ReturnStatement extends Debug {
    value: Expression;
}

interface ExpressionStatement extends Debug {
    expression: Expression;
}

interface LiteralExpression extends Debug {
    value: NumberLiteral | StringLiteral | BooleanLiteral;
}

interface BlockStatement extends Debug {
    statements: Array<Statement>;
}

interface PrefixExpression extends Debug {
    operator: TokenType;
    right: Expression;
}

interface InfixExpression extends Debug {
    left: Expression;
    right: Expression;
    operator: TokenType;
}

interface IfExpression extends Debug {
    condition: Expression;
    consequence: Expression;
    alternative: Expression | null;
}

interface FunctionExpression extends Debug {
    arguments: Array<Expression>;
    body: Statement;
}

interface CallExpression extends Debug {
    function: Expression;
    arguments: Array<Expression>;
}

interface ArrayExpression extends Debug {
    elements: Array<Expression>;
}

interface IndexExpression extends Debug {
    left: Expression;
    index: Expression;
}

interface IdentExpression extends Debug {
    value: string;
}

interface HashExpression extends Debug {
    pairs: Array<HashPair>;
}

interface HashPair extends Debug {
    key: Expression;
    value: Expression;
}

interface NumberLiteral extends Debug {
    value: number;
}

interface StringLiteral extends Debug {
    value: string;
}

interface BooleanLiteral extends Debug {
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
