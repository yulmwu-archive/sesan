import { TokenType } from '../tokenizer';

interface Program {
    statements: Array<Statement>;
}

type Statement =
    | LetStatement
    | AssignStatement
    | ReturnStatement
    | ExpressionStatement
    | BlockStatement
    | WhileStatement;

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

enum ExpressionKind {
    Literal = 0,
    Block,
    Prefix,
    Infix,
    If,
    Function,
    Call,
    Ident,
    Array,
    Index,
    Hash,
    Null,
}

enum NodeKind {
    Program = 100,
    LetStatement,
    ReturnStatement,
    ExpressionStatement,
    AssignStatement,
    WhileStatement,
}

enum LiteralKind {
    String = 200,
    Number,
    Boolean,
}

interface Debug {
    debug?: string;
}

interface Position {
    line: number;
    column: number;
}

interface LetStatement extends Debug, Position {
    ident: Expression;
    value: Expression;
    kind: NodeKind.LetStatement;
}

interface AssignStatement extends Debug, Position {
    ident: Expression;
    value: Expression;
    kind: NodeKind.AssignStatement;
}

interface ReturnStatement extends Debug, Position {
    value: Expression;
    kind: NodeKind.ReturnStatement;
}

interface WhileStatement extends Debug, Position {
    condition: Expression;
    body: Expression;
    kind: NodeKind.WhileStatement;
}

interface ExpressionStatement extends Debug, Position {
    expression: Expression;
    kind: NodeKind.ExpressionStatement;
}

interface LiteralExpression extends Debug, Position {
    value: NumberLiteral | StringLiteral | BooleanLiteral;
    kind: ExpressionKind.Literal;
}

interface BlockStatement extends Debug, Position {
    statements: Array<Statement>;
    kind: ExpressionKind.Block;
}

interface PrefixExpression extends Debug, Position {
    operator: TokenType;
    right: Expression;
    kind: ExpressionKind.Prefix;
}

interface InfixExpression extends Debug, Position {
    left: Expression;
    right: Expression;
    operator: TokenType;
    kind: ExpressionKind.Infix;
}

interface IfExpression extends Debug, Position {
    condition: Expression;
    consequence: Expression;
    alternative: Expression | null;
    kind: ExpressionKind.If;
}

interface FunctionExpression extends Debug, Position {
    function: Expression;
    arguments: Array<Expression>;
    body: Expression;
    kind: ExpressionKind.Function;
}

interface CallExpression extends Debug, Position {
    function: Expression;
    arguments: Array<Expression>;
    kind: ExpressionKind.Call;
}

interface ArrayExpression extends Debug, Position {
    elements: Array<Expression>;
    kind: ExpressionKind.Array;
}

interface IndexExpression extends Debug, Position {
    left: Expression;
    index: Expression;
    kind: ExpressionKind.Index;
}

interface IdentExpression extends Debug, Position {
    value: string;
    kind: ExpressionKind.Ident;
}

interface HashExpression extends Debug, Position {
    pairs: Array<HashPair>;
    kind: ExpressionKind.Hash;
}

interface HashPair extends Debug, Position {
    key: Expression;
    value: Expression;
}

interface NumberLiteral extends Debug, Position {
    value: number;
    kind: LiteralKind.Number;
}

interface StringLiteral extends Debug, Position {
    value: string;
    kind: LiteralKind.String;
}

interface BooleanLiteral extends Debug, Position {
    value: boolean;
    kind: LiteralKind.Boolean;
}

interface ParseError extends Position {
    message: string;
}

export {
    Program,
    Statement,
    Expression,
    LiteralKind,
    NodeKind,
    ExpressionKind,
    LetStatement,
    AssignStatement,
    ReturnStatement,
    WhileStatement,
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
    ParseError,
    Position,
};
