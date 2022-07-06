import { Lexer, Token, TokenType } from '../tokenizer';
import {
    AssignStatement,
    BlockStatement,
    Expression,
    ExpressionKind,
    ExpressionStatement,
    HashExpression,
    HashPair,
    IdentExpression,
    LetStatement,
    LiteralKind,
    NodeKind,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    WhileStatement,
} from '.';

enum Priority {
    LOWEST = 1,
    EQUAL,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
    INDEX,
}

export default class Parser {
    public currToken!: Token;
    public peekToken!: Token;
    public errors: Array<string> = [];

    constructor(public lexer: Lexer) {
        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        let program: Program = {
            statements: [],
        };

        while (this.currToken.type !== TokenType.EOF) {
            const statement = this.parseStatement();
            if (statement) program.statements.push(statement);

            this.nextToken();
        }

        return program;
    }

    private parseStatement(): Statement | null {
        switch (this.currToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();

            case TokenType.RETURN:
                return this.parseReturnStatement();

            case TokenType.WHILE:
                return this.parseWhileStatement();

            case TokenType.COMMENT:
                return null;

            default:
                if (this.peekTokenIs(TokenType.ASSIGN))
                    return this.parseAssignmentStatement();

                return this.parseExpressionStatement();
        }
    }

    private nextToken() {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private expectPeek(tokenType: TokenType, err: boolean = true): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();

            return true;
        }

        if (err) this.peekError(tokenType);

        return false;
    }

    private peekTokenIs(tokenType: TokenType): boolean {
        if (tokenType === TokenType.IDENT) {
            if (this.peekToken.type === TokenType.IDENT) return true;

            return false;
        }

        return this.peekToken.type === tokenType;
    }

    private currTokenIs(tokenType: TokenType): boolean {
        return this.currToken.type === tokenType;
    }

    private peekError(tokenType: TokenType) {
        this.errors.push(
            `Expected next token to be ${tokenType}, got ${this.peekToken.type} instead.`
        );
    }

    private parseLetStatement(): LetStatement | null {
        if (!this.expectPeek(TokenType.IDENT)) return null;

        const ident: IdentExpression = {
            debug: 'parseLetStatement>ident',
            value:
                this.currToken.type === TokenType.IDENT
                    ? this.currToken.literal
                    : '',
            kind: ExpressionKind.Ident,
        };

        if (!this.expectPeek(TokenType.ASSIGN)) return null;

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseLetStatement>return',
            ident,
            value: expression,
            kind: NodeKind.LetStatement,
        };
    }

    private parseAssignmentStatement(): AssignStatement | null {
        const ident: IdentExpression = {
            debug: 'parseAssignStatement>ident',
            value:
                this.currToken.type === TokenType.IDENT
                    ? this.currToken.literal
                    : '',
            kind: ExpressionKind.Ident,
        };

        if (!this.expectPeek(TokenType.ASSIGN)) return null;

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseAssignStatement>return',
            ident,
            value: expression,
            kind: NodeKind.AssignStatement,
        };
    }

    private parseReturnStatement(): ReturnStatement | null {
        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseReturnStatement>return',
            value: expression,
            kind: NodeKind.ReturnStatement,
        };
    }

    private parseWhileStatement(): WhileStatement | null {
        if (!this.expectPeek(TokenType.LPAREN)) return null;

        const condition = this.parseExpression(Priority.LOWEST);

        if (!this.expectPeek(TokenType.LBRACE)) return null;

        const body = this.parseBlockStatement();

        return {
            debug: 'parseWhileStatement>return',
            condition,
            body,
            kind: NodeKind.WhileStatement,
        };
    }

    private parseExpression(priority: Priority): Expression | null {
        let left: Expression = this.parsePrefix();
        if (!left) return null;

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            priority < this.peekPriority()
        ) {
            this.nextToken();
            left = this.parseInfixExpression(left);
        }

        return left;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const expression = this.parseExpression(Priority.LOWEST);
        if (!expression) return null;

        if (this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseExpressionStatement>return',
            expression,
            kind: NodeKind.ExpressionStatement,
        };
    }

    private parsePrefix(): Expression | null {
        switch (this.currToken.type) {
            case TokenType.IDENT:
                return {
                    debug: 'parsePrefix>case>ident',
                    value: this.currToken.literal,
                    kind: ExpressionKind.Ident,
                };

            case TokenType.NUMBER:
                return {
                    debug: 'parsePrefix>case>number',
                    value: {
                        value: Number(this.currToken.literal),
                        kind: LiteralKind.Number,
                    },
                    kind: ExpressionKind.Literal,
                };

            case TokenType.STRING:
                return {
                    debug: 'parsePrefix>case>string',
                    value: {
                        value: this.currToken.literal,
                        kind: LiteralKind.String,
                    },
                    kind: ExpressionKind.Literal,
                };

            case TokenType.BANG:
                return this.prefixParseOps();

            case TokenType.MINUS:
                return this.prefixParseOps();

            case TokenType.TRUE:
                return {
                    debug: 'parsePrefix>case>true',
                    value: { value: true, kind: LiteralKind.Boolean },
                    kind: ExpressionKind.Literal,
                };

            case TokenType.FALSE:
                return {
                    debug: 'parsePrefix>case>false',
                    value: { value: false, kind: LiteralKind.Boolean },
                    kind: ExpressionKind.Literal,
                };

            case TokenType.LPAREN: {
                this.nextToken();

                const expression = this.parseExpression(Priority.LOWEST);

                if (!this.expectPeek(TokenType.RPAREN)) return null;

                return expression;
            }

            case TokenType.IF: {
                if (!this.expectPeek(TokenType.LPAREN)) return null;

                this.nextToken();

                const condition = this.parseExpression(Priority.LOWEST);

                if (
                    !this.expectPeek(TokenType.RPAREN) ||
                    !this.expectPeek(TokenType.LBRACE)
                )
                    return null;

                const consequence = this.parseBlockStatement();

                let alternative: Expression | null = null;

                if (this.peekTokenIs(TokenType.ELSE)) {
                    this.nextToken();

                    if (!this.expectPeek(TokenType.LBRACE)) return null;

                    alternative = this.parseBlockStatement();
                }

                return {
                    debug: 'parsePrefix>case>if',
                    condition,
                    consequence,
                    alternative,
                    kind: ExpressionKind.If,
                };
            }

            case TokenType.FUNCTION: {
                if (!this.expectPeek(TokenType.LPAREN)) return null;

                const parameters = this.parseFunctionParameters();

                if (!this.expectPeek(TokenType.LBRACE)) return null;

                const body = this.parseBlockStatement();

                if (!body) return null;

                return {
                    debug: 'parsePrefix>case>function',
                    arguments: parameters,
                    body,
                    kind: ExpressionKind.Function,
                };
            }

            case TokenType.LBRACKET:
                return {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: this.parseExpressionArguments(TokenType.RBRACKET),
                    kind: ExpressionKind.Array,
                };

            case TokenType.LBRACE:
                return this.parseHash();

            default:
                return null;
        }
    }

    private prefixParseOps(): PrefixExpression | null {
        const token = this.currToken;

        this.nextToken();

        return {
            debug: 'prefixParseOps>return',
            operator: token.type,
            right: this.parseExpression(Priority.PREFIX),
            kind: ExpressionKind.Prefix,
        };
    }

    private parseInfixExpression(left: Expression): Expression | null {
        switch (this.currToken.type) {
            case TokenType.LPAREN:
                return {
                    debug: 'parseInfixExpression>case>Lparen',
                    function: left,
                    arguments: this.parseExpressionArguments(TokenType.RPAREN),
                    kind: ExpressionKind.Call,
                };

            case TokenType.LBRACKET: {
                this.nextToken();
                const expression = this.parseExpression(Priority.LOWEST);

                if (!this.expectPeek(TokenType.RBRACKET))
                    return {
                        debug: 'parseInfixExpression>case>Lbracket',
                        left,
                        index: {
                            debug: 'parseInfixExpression>case>Lbracket>index',
                            value: {
                                debug: 'parseInfixExpression>case>Lbracket>index>value',
                                value: 0,
                                kind: LiteralKind.Number,
                            },
                            kind: ExpressionKind.Literal,
                        },
                        kind: ExpressionKind.Index,
                    };

                return {
                    debug: 'parseInfixExpression>case>Lbracket',
                    left,
                    index: expression,
                    kind: ExpressionKind.Index,
                };
            }

            default: {
                const operator = this.currToken;

                const priority = this.currPriority();

                this.nextToken();

                const right = this.parseExpression(priority);
                if (!right) return null;

                return {
                    debug: 'parseInfixExpression>case>default',
                    left,
                    operator: operator.type,
                    right,
                    kind: ExpressionKind.Infix,
                };
            }
        }
    }

    private parseBlockStatement(): BlockStatement | null {
        let statements: Array<Statement> = [];

        this.nextToken();

        while (
            !this.currTokenIs(TokenType.RBRACE) &&
            !this.currTokenIs(TokenType.EOF)
        ) {
            const statement = this.parseStatement();
            if (statement) statements.push(statement);
            this.nextToken();
        }

        return {
            debug: 'parseBlockStatement>return',
            statements,
            kind: ExpressionKind.Block,
        };
    }

    private parseFunctionParameters(): Array<Expression> {
        let parameters: Array<Expression> = [];

        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return [];
        }

        this.nextToken();

        parameters.push({
            value: this.currToken.literal,
            kind: ExpressionKind.Ident,
        });

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            parameters.push({
                value: this.currToken.literal,
                kind: ExpressionKind.Ident,
            });
        }

        if (this.expectPeek(TokenType.RPAREN)) return parameters;

        return parameters;
    }

    private parseExpressionArguments(end: TokenType): Array<Expression> {
        const args: Array<Expression> = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();

            return args;
        }

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);
        if (expression) args.push(expression);

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const expression = this.parseExpression(Priority.LOWEST);
            if (expression) args.push(expression);
        }

        if (this.expectPeek(end, false)) return args;

        return args;
    }

    private parseHash(): HashExpression | null {
        const pairs: Array<HashPair> = [];

        while (!this.peekTokenIs(TokenType.RBRACE)) {
            this.nextToken();

            const key = this.parseExpression(Priority.LOWEST);

            if (this.peekTokenIs(TokenType.COLON)) {
                this.nextToken();
                this.nextToken();
            }

            const value = this.parseExpression(Priority.LOWEST);

            if (
                !this.expectPeek(TokenType.COMMA) &&
                !this.peekTokenIs(TokenType.RBRACE)
            )
                return null;

            if (key === null || value === null) continue;

            pairs.push({
                key,
                value,
            });
        }

        if (!this.expectPeek(TokenType.RBRACE)) return null;

        return {
            debug: 'parseHash>return',
            pairs,
            kind: ExpressionKind.Hash,
        };
    }

    private peekPriority(): Priority {
        return this.getPriority(this.peekToken);
    }

    private currPriority(): Priority {
        return this.getPriority(this.currToken);
    }

    private getPriority(token: Token): Priority {
        switch (token.type) {
            case TokenType.EQUAL:
            case TokenType.NOT_EQUAL:
                return Priority.EQUAL;

            case TokenType.LT:
            case TokenType.GT:
                return Priority.LESSGREATER;

            case TokenType.PLUS:
            case TokenType.MINUS:
                return Priority.SUM;

            case TokenType.SLASH:
            case TokenType.ASTERISK:
            case TokenType.PERCENT:
                return Priority.PRODUCT;

            case TokenType.LPAREN:
                return Priority.CALL;

            case TokenType.LBRACKET:
                return Priority.INDEX;

            default:
                return Priority.LOWEST;
        }
    }
}
