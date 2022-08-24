import { TokenType } from '../../index'

export interface Program {
    statements: Array<Statement>
    errors: Array<ParseError>
}

export enum Priority {
    LOWEST = 1,
    ASSIGN,
    AND_OR,
    EQUAL,
    LESS_GREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
    INDEX,
}

export type Statement = LetStatement | ReturnStatement | ExpressionStatement | BlockStatement | WhileStatement | DecoratorStatement

export type Expression =
    | LiteralExpression
    | BlockStatement
    | PrefixExpression
    | InfixExpression
    | IfExpression
    | MatchExpression
    | FunctionExpression
    | CallExpression
    | IdentExpression
    | ArrayExpression
    | IndexExpression
    | ObjectExpression
    | TypeofExpression
    | ThrowExpression
    | DeleteExpression
    | UseExpression
    | VoidExpression
    | ExprExpression
    | null

export enum ExpressionKind {
    Literal = 0,
    Block,
    Prefix,
    Infix,
    If,
    Match,
    Function,
    Call,
    Ident,
    Array,
    Index,
    Object,
    Typeof,
    Throw,
    Delete,
    Use,
    Void,
    Expr,
    Null,
}

export enum NodeKind {
    Program = 100,
    LetStatement,
    ReturnStatement,
    ExpressionStatement,
    WhileStatement,
    DecoratorStatement,
}

export enum LiteralKind {
    String = 200,
    Number,
    Boolean,
    Null,
}

export interface Debug {
    debug?: string
}

export interface Position {
    line: number
    column: number
}

export interface LetStatement extends Debug, Position {
    ident: Expression
    value: Expression
    kind: NodeKind.LetStatement
}

export interface ReturnStatement extends Debug, Position {
    value: Expression
    kind: NodeKind.ReturnStatement
}

export interface WhileStatement extends Debug, Position {
    condition: Expression
    body: Expression
    kind: NodeKind.WhileStatement
}

export interface DecoratorStatement extends Debug, Position {
    value: Expression
    function: Expression
    kind: NodeKind.DecoratorStatement
}

export interface ExpressionStatement extends Debug, Position {
    expression: Expression
    kind: NodeKind.ExpressionStatement
}

export interface LiteralExpression extends Debug, Position {
    value: NumberLiteral | StringLiteral | BooleanLiteral | NullLiteral
    kind: ExpressionKind.Literal
}

export interface BlockStatement extends Debug, Position {
    statements: Array<Statement>
    returnFinal: boolean
    kind: ExpressionKind.Block
}

export interface PrefixExpression extends Debug, Position {
    operator: TokenType
    right: Expression
    kind: ExpressionKind.Prefix
}

export interface InfixExpression extends Debug, Position {
    left: Expression
    right: Expression
    operator: TokenType
    kind: ExpressionKind.Infix
}

export interface IfExpression extends Debug, Position {
    condition: Expression
    consequence: Expression
    alternative: Expression | null
    kind: ExpressionKind.If
}

export interface MatchExpression extends Debug, Position {
    condition: Expression
    cases: Array<MatchCase>
    kind: ExpressionKind.Match
}

export interface MatchCase extends Debug, Position {
    pattern: Expression
    body: Expression
}

export interface FunctionExpression extends Debug, Position {
    function: Expression
    parameters: Array<Expression>
    body: Expression
    kind: ExpressionKind.Function
}

export interface CallExpression extends Debug, Position {
    function: Expression
    parameters: Array<Expression>
    kind: ExpressionKind.Call
}

export interface ArrayExpression extends Debug, Position {
    elements: Array<Expression>
    kind: ExpressionKind.Array
}

export interface IndexExpression extends Debug, Position {
    left: Expression
    index: Expression
    kind: ExpressionKind.Index
}

export interface IdentExpression extends Debug, Position {
    value: string
    kind: ExpressionKind.Ident
}

export interface ObjectExpression extends Debug, Position {
    pairs: Array<ObjectPair>
    kind: ExpressionKind.Object
}

export interface ObjectPair extends Debug, Position {
    key: Expression
    value: Expression
}

export interface TypeofExpression extends Debug, Position {
    value: Expression
    kind: ExpressionKind.Typeof
}

export interface ThrowExpression extends Debug, Position {
    message: Expression
    line: number
    column: number
    kind: ExpressionKind.Throw
}

export interface DeleteExpression extends Debug, Position {
    value: Expression
    kind: ExpressionKind.Delete
}

export interface UseExpression extends Debug, Position {
    path: Expression
    kind: ExpressionKind.Use
}

export interface VoidExpression extends Debug, Position {
    value: Expression
    kind: ExpressionKind.Void
}

export interface ExprExpression extends Debug, Position {
    value: Expression
    kind: ExpressionKind.Expr
}

export interface NumberLiteral extends Debug, Position {
    value: number
    kind: LiteralKind.Number
}

export interface StringLiteral extends Debug, Position {
    value: string
    kind: LiteralKind.String
}

export interface BooleanLiteral extends Debug, Position {
    value: boolean
    kind: LiteralKind.Boolean
}

export interface NullLiteral extends Debug, Position {
    kind: LiteralKind.Null
}

export interface ParseError extends Position {
    message: string
}
