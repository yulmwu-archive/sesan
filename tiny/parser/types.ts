import { TokenType } from '../../index';

interface Program {
    statements: Array<Statement>;
    errors: Array<ParseError>;
}

type Statement =
    | LetStatement
    | ReturnStatement
    | ExpressionStatement
    | BlockStatement
    | WhileStatement
    | DecoratorStatement;

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
    | TypeofExpression
    | ThrowExpression
    | DeleteExpression
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
    Typeof,
    Throw,
    Delete,
    Null,
}

enum NodeKind {
    Program = 100,
    LetStatement,
    ReturnStatement,
    ExpressionStatement,
    WhileStatement,
    DecoratorStatement,
}

enum LiteralKind {
    String = 200,
    Number,
    Boolean,
    Null,
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

interface ReturnStatement extends Debug, Position {
    value: Expression;
    kind: NodeKind.ReturnStatement;
}

interface WhileStatement extends Debug, Position {
    condition: Expression;
    body: Expression;
    kind: NodeKind.WhileStatement;
}

interface DecoratorStatement extends Debug, Position {
    value: Expression;
    function: Expression;
    kind: NodeKind.DecoratorStatement;
}

interface ExpressionStatement extends Debug, Position {
    expression: Expression;
    kind: NodeKind.ExpressionStatement;
}

interface LiteralExpression extends Debug, Position {
    value: NumberLiteral | StringLiteral | BooleanLiteral | NullLiteral;
    kind: ExpressionKind.Literal;
}

interface BlockStatement extends Debug, Position {
    statements: Array<Statement>;
    returnFinal: boolean;
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

interface TypeofExpression extends Debug, Position {
    value: Expression;
    kind: ExpressionKind.Typeof;
}

interface ThrowExpression extends Debug, Position {
    message: Expression;
    line: number;
    column: number;
    kind: ExpressionKind.Throw;
}

interface DeleteExpression extends Debug, Position {
    value: Expression;
    kind: ExpressionKind.Delete;
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

interface NullLiteral extends Debug, Position {
    kind: LiteralKind.Null;
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
    ReturnStatement,
    WhileStatement,
    DecoratorStatement,
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
    TypeofExpression,
    ThrowExpression,
    DeleteExpression,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
    NullLiteral,
    ParseError,
    Position,
};
