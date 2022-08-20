import * as Tiny from '../../index';

export default class Parser {
    public currToken!: Tiny.Token;
    public peekToken!: Tiny.Token;
    public currLine: number = 1;
    public currColumn: number = 1;

    public messages: Tiny.Errors;

    public errors: Array<Tiny.ParseError> = [];

    constructor(public lexer: Tiny.Lexer, public option: Tiny.Options) {
        this.messages = Tiny.localization(option);

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Tiny.Program {
        let program: Tiny.Program = {
            statements: [],
            errors: [],
        };

        while (this.currToken.type !== Tiny.TokenType.EOF) {
            const statement = this.parseStatement();
            if (statement) program.statements.push(statement);

            this.nextToken();
        }

        program.errors = this.errors;

        return program;
    }

    private parseStatement(): Tiny.Statement | null {
        switch (this.currToken.type) {
            case Tiny.TokenType.LET:
                return this.parseLetStatement();

            case Tiny.TokenType.RETURN:
                return this.parseReturnStatement();

            case Tiny.TokenType.WHILE:
                return this.parseWhileStatement();

            case Tiny.TokenType.AT:
                return this.parseDecorator();

            case Tiny.TokenType.COMMENT:
                return null;

            default:
                return this.parseExpressionStatement();
        }
    }

    private nextToken() {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
        this.currLine = this.peekToken.line;
        this.currColumn = this.peekToken.column;
    }

    private currPos() {
        return {
            line: this.currLine,
            column: this.currColumn,
        };
    }

    private expectPeek(tokenType: Tiny.TokenType): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();

            return true;
        }

        this.pushError(
            Tiny.errorFormatter(
                this.messages.parseError.unexpectedToken,
                tokenType,
                this.peekToken.type
            )
        );

        return false;
    }

    private peekTokenIs(tokenType: Tiny.TokenType): boolean {
        if (tokenType === Tiny.TokenType.IDENT) {
            if (this.peekToken.type === Tiny.TokenType.IDENT) return true;

            return false;
        }

        return this.peekToken.type === tokenType;
    }

    private currTokenIs(tokenType: Tiny.TokenType): boolean {
        return this.currToken.type === tokenType;
    }

    private pushError(message: string) {
        this.errors.push({
            line: this.currLine,
            column: this.currColumn,
            message,
        });
    }

    private parseLetStatement(): Tiny.LetStatement | null {
        if (!this.expectPeek(Tiny.TokenType.IDENT)) return null;

        const ident: Tiny.IdentExpression = {
            debug: 'parseLetStatement>ident',
            value:
                this.currToken.type === Tiny.TokenType.IDENT
                    ? this.currToken.literal
                    : '',
            kind: Tiny.ExpressionKind.Ident,
            ...this.currPos(),
        };

        if (!this.expectPeek(Tiny.TokenType.ASSIGN)) return null;

        this.nextToken();

        const expression = this.parseExpression(Tiny.Priority.LOWEST);

        if (!this.expectPeek(Tiny.TokenType.SEMICOLON)) return null;

        return {
            debug: 'parseLetStatement>return',
            ident,
            value: expression,
            kind: Tiny.NodeKind.LetStatement,
            ...this.currPos(),
        };
    }

    private parseReturnStatement(): Tiny.ReturnStatement | null {
        this.nextToken();

        const expression = this.parseExpression(Tiny.Priority.LOWEST);

        if (this.peekTokenIs(Tiny.TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseReturnStatement>return',
            value: expression,
            kind: Tiny.NodeKind.ReturnStatement,
            ...this.currPos(),
        };
    }

    private parseWhileStatement(): Tiny.WhileStatement | null {
        if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

        return {
            debug: 'parseWhileStatement>return',
            condition: this.parseExpression(Tiny.Priority.LOWEST),
            body: this.parseBlockStatement(),
            kind: Tiny.NodeKind.WhileStatement,
            ...this.currPos(),
        };
    }

    private parseDecorator(): Tiny.DecoratorStatement | null {
        this.nextToken();

        const value = this.parseExpression(Tiny.Priority.LOWEST);

        this.nextToken();

        if (this.currTokenIs(Tiny.TokenType.SEMICOLON)) this.nextToken();

        const func = this.parseExpression(Tiny.Priority.LOWEST);

        if (func?.kind !== Tiny.ExpressionKind.Function) {
            this.pushError(this.messages.parseError.decoratorRequiresFunction);

            return null;
        }

        return {
            debug: 'parseDecorator>return',
            value,
            function: func,
            kind: Tiny.NodeKind.DecoratorStatement,
            ...this.currPos(),
        };
    }

    private parseExpression(priority: Tiny.Priority): Tiny.Expression | null {
        let left: Tiny.Expression = this.parsePrefix();

        if (!left)
            if (!this.currTokenIs(Tiny.TokenType.SEMICOLON))
                this.pushError(
                    Tiny.errorFormatter(
                        this.messages.parseError.unexpectedExpression,
                        this.currToken.type
                    )
                );
            else return null;

        while (
            !this.peekTokenIs(Tiny.TokenType.SEMICOLON) &&
            priority < this.peekPriority()
        ) {
            this.nextToken();
            left = this.parseInfixExpression(left);
        }

        return left;
    }

    private parseExpressionStatement(): Tiny.ExpressionStatement | null {
        const expression = this.parseExpression(Tiny.Priority.LOWEST);
        if (!expression) return null;

        if (
            expression.kind !== Tiny.ExpressionKind.If &&
            expression.kind !== Tiny.ExpressionKind.Function &&
            !this.expectPeek(Tiny.TokenType.SEMICOLON)
        )
            return null;

        return {
            debug: 'parseExpressionStatement>return',
            expression,
            kind: Tiny.NodeKind.ExpressionStatement,
            ...this.currPos(),
        };
    }

    private parsePrefix(): Tiny.Expression | null {
        switch (this.currToken.type) {
            case Tiny.TokenType.IDENT:
                return {
                    debug: 'parsePrefix>case>ident',
                    value: this.currToken.literal,
                    kind: Tiny.ExpressionKind.Ident,
                    ...this.currPos(),
                };

            case Tiny.TokenType.NUMBER:
                return {
                    debug: 'parsePrefix>case>number',
                    value: {
                        value: Number(this.currToken.literal),
                        kind: Tiny.LiteralKind.Number,
                        ...this.currPos(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.currPos(),
                };

            case Tiny.TokenType.STRING:
                return {
                    debug: 'parsePrefix>case>string',
                    value: {
                        value: this.currToken.literal,
                        kind: Tiny.LiteralKind.String,
                        ...this.currPos(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.currPos(),
                };

            case Tiny.TokenType.BANG:
            case Tiny.TokenType.MINUS:
                return this.prefixParseOps();

            case Tiny.TokenType.TRUE:
            case Tiny.TokenType.FALSE:
                return {
                    debug: 'parsePrefix>case>true',
                    value: {
                        value: this.currToken.type === Tiny.TokenType.TRUE,
                        kind: Tiny.LiteralKind.Boolean,
                        ...this.currPos(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.currPos(),
                };

            case Tiny.TokenType.NULL:
                return {
                    debug: 'parsePrefix>case>null',
                    value: {
                        kind: Tiny.LiteralKind.Null,
                        ...this.currPos(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.currPos(),
                };

            case Tiny.TokenType.LPAREN: {
                this.nextToken();

                const expression = this.parseExpression(Tiny.Priority.LOWEST);

                if (!this.expectPeek(Tiny.TokenType.RPAREN)) return null;

                if (!expression) return null;

                return expression;
            }

            case Tiny.TokenType.IF: {
                if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

                this.nextToken();

                const condition = this.parseExpression(Tiny.Priority.LOWEST);

                if (!this.expectPeek(Tiny.TokenType.RPAREN)) return null;

                const consequence = this.parseBlockStatement();

                let alternative: Tiny.Expression | null = null;

                if (this.peekTokenIs(Tiny.TokenType.ELSE)) {
                    this.nextToken();

                    alternative = this.parseBlockStatement();
                }

                return {
                    debug: 'parsePrefix>case>if',
                    condition,
                    consequence,
                    alternative,
                    kind: Tiny.ExpressionKind.If,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.FUNCTION: {
                let name: Tiny.Expression | null = null;

                if (!this.peekTokenIs(Tiny.TokenType.IDENT)) name = null;
                else {
                    this.nextToken();

                    name = {
                        debug: 'parsePrefix>case>function>name',
                        value: this.currToken.literal,
                        kind: Tiny.ExpressionKind.Ident,
                        ...this.currPos(),
                    };
                }

                if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

                const parameters = this.parseFunctionParameters();

                const body = this.parseBlockStatement();
                if (!body) return null;

                return {
                    debug: 'parsePrefix>case>function',
                    function: name,
                    parameters: parameters,
                    body,
                    kind: Tiny.ExpressionKind.Function,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.LBRACKET:
                return {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: this.parseExpressionParameters(
                        Tiny.TokenType.RBRACKET
                    ),
                    kind: Tiny.ExpressionKind.Array,
                    ...this.currPos(),
                };

            case Tiny.TokenType.LBRACE: {
                const pairs: Array<Tiny.ObjectPair> = [];

                while (!this.peekTokenIs(Tiny.TokenType.RBRACE)) {
                    this.nextToken();

                    let key = this.parseExpression(Tiny.Priority.LOWEST);

                    if (key?.kind === Tiny.ExpressionKind.Ident)
                        key = {
                            debug: 'parseHash>ident>key',
                            value: {
                                debug: 'parseHash>ident>key>value',
                                value: key.value,
                                kind: Tiny.LiteralKind.String,
                                ...this.currPos(),
                            },
                            kind: Tiny.ExpressionKind.Literal,
                            ...this.currPos(),
                        };

                    let value: Tiny.Expression = null;

                    if (!this.peekTokenIs(Tiny.TokenType.COLON))
                        value = this.parseExpression(Tiny.Priority.LOWEST);
                    else {
                        this.nextToken();
                        this.nextToken();

                        value = this.parseExpression(Tiny.Priority.LOWEST);
                    }

                    if (
                        !this.peekTokenIs(Tiny.TokenType.RBRACE) &&
                        !this.expectPeek(Tiny.TokenType.COMMA)
                    )
                        return null;

                    if (key === null || value === null) continue;

                    pairs.push({
                        key,
                        value,
                        ...this.currPos(),
                    });
                }

                if (!this.expectPeek(Tiny.TokenType.RBRACE)) return null;

                return {
                    debug: 'parseHash>return',
                    pairs,
                    kind: Tiny.ExpressionKind.Object,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.TYPEOF: {
                this.nextToken();

                const expression = this.parseExpression(Tiny.Priority.PREFIX);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>typeof',
                    value: expression,
                    kind: Tiny.ExpressionKind.Typeof,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.THROW: {
                this.nextToken();

                const expression = this.parseExpression(Tiny.Priority.PREFIX);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>throw',
                    message: expression,
                    line: this.currPos().line,
                    column: this.currPos().column,
                    kind: Tiny.ExpressionKind.Throw,
                };
            }

            case Tiny.TokenType.DELETE: {
                if (!this.expectPeek(Tiny.TokenType.IDENT)) return null;

                const expression = this.parseExpression(Tiny.Priority.PREFIX);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>delete',
                    value: expression,
                    kind: Tiny.ExpressionKind.Delete,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.USE: {
                if (!this.expectPeek(Tiny.TokenType.STRING)) return null;

                const expression = this.parseExpression(Tiny.Priority.PREFIX);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>use',
                    path: expression,
                    kind: Tiny.ExpressionKind.Use,
                    ...this.currPos(),
                };
            }

            case Tiny.TokenType.VOID: {
                this.nextToken();

                const expression = this.parseExpression(Tiny.Priority.PREFIX);

                if (!expression)
                    this.pushError(
                        this.messages.parseError.voidRequiresExpression
                    );

                return {
                    debug: 'parsePrefix>case>void',
                    value: expression,
                    kind: Tiny.ExpressionKind.Void,
                    ...this.currPos(),
                };
            }

            default:
                return null;
        }
    }

    private prefixParseOps(): Tiny.PrefixExpression | null {
        const operator = this.currToken;

        this.nextToken();

        return {
            debug: 'prefixParseOps>return',
            operator: operator.type,
            right: this.parseExpression(Tiny.Priority.PREFIX),
            kind: Tiny.ExpressionKind.Prefix,
            ...this.currPos(),
        };
    }

    private parseInfixExpression(
        left: Tiny.Expression
    ): Tiny.Expression | null {
        switch (this.currToken.type) {
            case Tiny.TokenType.LPAREN:
                return {
                    debug: 'parseInfixExpression>case>Lparen',
                    function: left,
                    parameters: this.parseExpressionParameters(
                        Tiny.TokenType.RPAREN
                    ),
                    kind: Tiny.ExpressionKind.Call,
                    ...this.currPos(),
                };

            case Tiny.TokenType.LBRACKET: {
                this.nextToken();
                const expression = this.parseExpression(Tiny.Priority.LOWEST);

                if (!this.expectPeek(Tiny.TokenType.RBRACKET))
                    return {
                        debug: 'parseInfixExpression>case>Lbracket',
                        left,
                        index: {
                            debug: 'parseInfixExpression>case>Lbracket>index',
                            value: {
                                debug: 'parseInfixExpression>case>Lbracket>index>value',
                                value: 0,
                                kind: Tiny.LiteralKind.Number,
                                ...this.currPos(),
                            },
                            kind: Tiny.ExpressionKind.Literal,
                            ...this.currPos(),
                        },
                        kind: Tiny.ExpressionKind.Index,
                        ...this.currPos(),
                    };

                return {
                    debug: 'parseInfixExpression>case>Lbracket',
                    left,
                    index: expression,
                    kind: Tiny.ExpressionKind.Index,
                    ...this.currPos(),
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
                    kind: Tiny.ExpressionKind.Infix,
                    ...this.currPos(),
                };
            }
        }
    }

    private parseBlockStatement(): Tiny.BlockStatement | null {
        if (!this.peekTokenIs(Tiny.TokenType.LBRACE)) {
            this.nextToken();

            const expression = this.parseExpression(Tiny.Priority.LOWEST);

            if (!expression) return null;

            return {
                debug: 'parseBlockStatement>return',
                statements: [
                    {
                        debug: 'parseBlockStatement>return>statement',
                        expression,
                        kind: Tiny.NodeKind.ExpressionStatement,
                        ...this.currPos(),
                    },
                ],
                returnFinal: true,
                kind: Tiny.ExpressionKind.Block,
                ...this.currPos(),
            };
        }

        this.nextToken();

        let statements: Array<Tiny.Statement> = [];

        this.nextToken();

        while (
            !this.currTokenIs(Tiny.TokenType.RBRACE) &&
            !this.currTokenIs(Tiny.TokenType.EOF)
        ) {
            const statement = this.parseStatement();
            if (statement) statements.push(statement);

            this.nextToken();
        }

        if (!this.currTokenIs(Tiny.TokenType.RBRACE)) {
            this.pushError(
                Tiny.errorFormatter(
                    this.messages.parseError.unexpectedToken,
                    Tiny.TokenType.RPAREN,
                    this.peekToken.type
                )
            );

            return null;
        }

        return {
            debug: 'parseBlockStatement>return',
            statements,
            returnFinal: false,
            kind: Tiny.ExpressionKind.Block,
            ...this.currPos(),
        };
    }

    private parseFunctionParameters(): Array<Tiny.Expression> {
        let parameters: Array<Tiny.Expression> = [];

        if (this.peekTokenIs(Tiny.TokenType.RPAREN)) {
            this.nextToken();

            return [];
        }

        this.nextToken();

        parameters.push({
            value: this.currToken.literal,
            kind: Tiny.ExpressionKind.Ident,
            ...this.currPos(),
        });

        while (this.peekTokenIs(Tiny.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            parameters.push({
                value: this.currToken.literal,
                kind: Tiny.ExpressionKind.Ident,
                ...this.currPos(),
            });
        }

        if (this.expectPeek(Tiny.TokenType.RPAREN)) return parameters;

        return parameters;
    }

    private parseExpressionParameters(
        end: Tiny.TokenType
    ): Array<Tiny.Expression> {
        const parameters: Array<Tiny.Expression> = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();

            return parameters;
        }

        this.nextToken();

        const expression = this.parseExpression(Tiny.Priority.LOWEST);
        if (expression) parameters.push(expression);

        while (this.peekTokenIs(Tiny.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const expression = this.parseExpression(Tiny.Priority.LOWEST);
            if (expression) parameters.push(expression);
        }

        if (!this.expectPeek(end)) return parameters;

        return parameters;
    }

    private peekPriority(): Tiny.Priority {
        return this.getPriority(this.peekToken);
    }

    private currPriority(): Tiny.Priority {
        return this.getPriority(this.currToken);
    }

    private getPriority(token: Tiny.Token): Tiny.Priority {
        switch (token.type) {
            case Tiny.TokenType.ASSIGN:
                return Tiny.Priority.ASSIGN;

            case Tiny.TokenType.AND:
            case Tiny.TokenType.OR:
                return Tiny.Priority.AND_OR;

            case Tiny.TokenType.EQUAL:
            case Tiny.TokenType.NOT_EQUAL:
                return Tiny.Priority.EQUAL;

            case Tiny.TokenType.LT:
            case Tiny.TokenType.GT:
            case Tiny.TokenType.LTE:
            case Tiny.TokenType.GTE:
            case Tiny.TokenType.IN:
                return Tiny.Priority.LESS_GREATER;

            case Tiny.TokenType.PLUS:
            case Tiny.TokenType.MINUS:
                return Tiny.Priority.SUM;

            case Tiny.TokenType.SLASH:
            case Tiny.TokenType.ASTERISK:
            case Tiny.TokenType.PERCENT:
                return Tiny.Priority.PRODUCT;

            case Tiny.TokenType.TYPEOF:
            case Tiny.TokenType.DELETE:
            case Tiny.TokenType.THROW:
            case Tiny.TokenType.USE:
            case Tiny.TokenType.VOID:
                return Tiny.Priority.PREFIX;

            case Tiny.TokenType.LPAREN:
                return Tiny.Priority.CALL;

            case Tiny.TokenType.LBRACKET:
            case Tiny.TokenType.ELEMENT:
            case Tiny.TokenType.IN:
            case Tiny.TokenType.NULLISH:
                return Tiny.Priority.INDEX;

            default:
                return Tiny.Priority.LOWEST;
        }
    }
}
