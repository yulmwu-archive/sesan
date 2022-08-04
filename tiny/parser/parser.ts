import * as Tiny from '../../index';

enum Priority {
    LOWEST = 1,
    LOGICAL,
    EQUAL,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
    INDEX,
}

export default class Parser {
    public currToken!: Tiny.Token;
    public peekToken!: Tiny.Token;
    public currLine: number = 1;
    public currColumn: number = 1;

    public messages;

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

    private curr() {
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
                this.messages.parserError.unexpectedToken,
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
            ...this.curr(),
        };

        if (!this.expectPeek(Tiny.TokenType.ASSIGN)) return null;

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.expectPeek(Tiny.TokenType.SEMICOLON)) return null;

        return {
            debug: 'parseLetStatement>return',
            ident,
            value: expression,
            kind: Tiny.NodeKind.LetStatement,
            ...this.curr(),
        };
    }

    private parseReturnStatement(): Tiny.ReturnStatement | null {
        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (this.peekTokenIs(Tiny.TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseReturnStatement>return',
            value: expression,
            kind: Tiny.NodeKind.ReturnStatement,
            ...this.curr(),
        };
    }

    private parseWhileStatement(): Tiny.WhileStatement | null {
        if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

        const condition = this.parseExpression(Priority.LOWEST);

        const body = this.parseBlockStatement(false);

        return {
            debug: 'parseWhileStatement>return',
            condition,
            body,
            kind: Tiny.NodeKind.WhileStatement,
            ...this.curr(),
        };
    }

    private parseDecorator(): Tiny.DecoratorStatement | null {
        this.nextToken();

        const value = this.parseExpression(Priority.LOWEST);

        this.nextToken();

        if (this.currTokenIs(Tiny.TokenType.SEMICOLON)) this.nextToken();

        const func = this.parseExpression(Priority.LOWEST);

        if (func?.kind !== Tiny.ExpressionKind.Function) {
            this.pushError(this.messages.parserError.decoratorRequiresFunction);

            return null;
        }

        return {
            debug: 'parseDecorator>return',
            value,
            function: func,
            kind: Tiny.NodeKind.DecoratorStatement,
            ...this.curr(),
        };
    }

    private parseExpression(priority: Priority): Tiny.Expression | null {
        let left: Tiny.Expression = this.parsePrefix();
        if (!left) {
            if (!this.currTokenIs(Tiny.TokenType.SEMICOLON))
                this.pushError(
                    Tiny.errorFormatter(
                        this.messages.parserError.unexpectedExpression,
                        this.currToken.type
                    )
                );
            return null;
        }

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
        const expression = this.parseExpression(Priority.LOWEST);
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
            ...this.curr(),
        };
    }

    private parsePrefix(): Tiny.Expression | null {
        switch (this.currToken.type) {
            case Tiny.TokenType.IDENT:
                return {
                    debug: 'parsePrefix>case>ident',
                    value: this.currToken.literal,
                    kind: Tiny.ExpressionKind.Ident,
                    ...this.curr(),
                };

            case Tiny.TokenType.NUMBER:
                return {
                    debug: 'parsePrefix>case>number',
                    value: {
                        value: Number(this.currToken.literal),
                        kind: Tiny.LiteralKind.Number,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            case Tiny.TokenType.STRING:
                return {
                    debug: 'parsePrefix>case>string',
                    value: {
                        value: this.currToken.literal,
                        kind: Tiny.LiteralKind.String,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            case Tiny.TokenType.BANG:
                return this.prefixParseOps();

            case Tiny.TokenType.MINUS:
                return this.prefixParseOps();

            case Tiny.TokenType.TRUE:
                return {
                    debug: 'parsePrefix>case>true',
                    value: {
                        value: true,
                        kind: Tiny.LiteralKind.Boolean,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            case Tiny.TokenType.FALSE:
                return {
                    debug: 'parsePrefix>case>false',
                    value: {
                        value: false,
                        kind: Tiny.LiteralKind.Boolean,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            case Tiny.TokenType.NULL:
                return {
                    debug: 'parsePrefix>case>null',
                    value: {
                        kind: Tiny.LiteralKind.Null,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            case Tiny.TokenType.LPAREN: {
                this.nextToken();

                const expression = this.parseExpression(Priority.LOWEST);

                if (!this.expectPeek(Tiny.TokenType.RPAREN)) return null;

                if (!expression) return null;

                return expression;
            }

            case Tiny.TokenType.IF: {
                if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

                this.nextToken();

                const condition = this.parseExpression(Priority.LOWEST);

                if (!this.expectPeek(Tiny.TokenType.RPAREN)) return null;

                const consequence = this.parseBlockStatement(true);

                let alternative: Tiny.Expression | null = null;

                if (this.peekTokenIs(Tiny.TokenType.ELSE)) {
                    this.nextToken();

                    alternative = this.parseBlockStatement(true);
                }

                return {
                    debug: 'parsePrefix>case>if',
                    condition,
                    consequence,
                    alternative,
                    kind: Tiny.ExpressionKind.If,
                    ...this.curr(),
                };
            }

            case Tiny.TokenType.FUNCTION: {
                return this.parseFunction();
            }

            case Tiny.TokenType.LBRACKET:
                return {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: this.parseExpressionArguments(
                        Tiny.TokenType.RBRACKET
                    ),
                    kind: Tiny.ExpressionKind.Array,
                    ...this.curr(),
                };

            case Tiny.TokenType.LBRACE:
                return this.parseHash();

            case Tiny.TokenType.TYPEOF: {
                this.nextToken();

                const expression = this.parseExpression(Priority.LOWEST);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>typeof',
                    value: expression,
                    kind: Tiny.ExpressionKind.Typeof,
                    ...this.curr(),
                };
            }

            case Tiny.TokenType.THROW: {
                this.nextToken();

                const expression = this.parseExpression(Priority.LOWEST);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>throw',
                    message: expression,
                    line: this.curr().line,
                    column: this.curr().column,
                    kind: Tiny.ExpressionKind.Throw,
                };
            }

            case Tiny.TokenType.DELETE: {
                if (!this.expectPeek(Tiny.TokenType.IDENT)) return null;

                const expression = this.parseExpression(Priority.LOWEST);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>delete',
                    value: expression,
                    kind: Tiny.ExpressionKind.Delete,
                    ...this.curr(),
                };
            }

            case Tiny.TokenType.USE: {
                if (!this.expectPeek(Tiny.TokenType.STRING)) return null;

                const expression = this.parseExpression(Priority.LOWEST);

                if (!expression) return null;

                return {
                    debug: 'parsePrefix>case>use',
                    path: expression,
                    kind: Tiny.ExpressionKind.Use,
                    ...this.curr(),
                };
            }

            default:
                return null;
        }
    }

    private parseFunction(): Tiny.Expression | null {
        let name: Tiny.Expression | null = null;

        if (!this.peekTokenIs(Tiny.TokenType.IDENT)) name = null;
        else {
            this.nextToken();

            name = {
                debug: 'parsePrefix>case>function>name',
                value: this.currToken.literal,
                kind: Tiny.ExpressionKind.Ident,
                ...this.curr(),
            };
        }

        if (!this.expectPeek(Tiny.TokenType.LPAREN)) return null;

        const parameters = this.parseFunctionParameters();

        const body = this.parseBlockStatement(false);

        if (!body) return null;

        return {
            debug: 'parsePrefix>case>function',
            function: name,
            arguments: parameters,
            body,
            kind: Tiny.ExpressionKind.Function,
            ...this.curr(),
        };
    }

    private prefixParseOps(): Tiny.PrefixExpression | null {
        const token = this.currToken;

        this.nextToken();

        return {
            debug: 'prefixParseOps>return',
            operator: token.type,
            right: this.parseExpression(Priority.PREFIX),
            kind: Tiny.ExpressionKind.Prefix,
            ...this.curr(),
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
                    arguments: this.parseExpressionArguments(
                        Tiny.TokenType.RPAREN
                    ),
                    kind: Tiny.ExpressionKind.Call,
                    ...this.curr(),
                };

            case Tiny.TokenType.LBRACKET: {
                this.nextToken();
                const expression = this.parseExpression(Priority.LOWEST);

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
                                ...this.curr(),
                            },
                            kind: Tiny.ExpressionKind.Literal,
                            ...this.curr(),
                        },
                        kind: Tiny.ExpressionKind.Index,
                        ...this.curr(),
                    };

                return {
                    debug: 'parseInfixExpression>case>Lbracket',
                    left,
                    index: expression,
                    kind: Tiny.ExpressionKind.Index,
                    ...this.curr(),
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
                    ...this.curr(),
                };
            }
        }
    }

    private parseBlockStatement(short: boolean): Tiny.BlockStatement | null {
        if (!this.peekTokenIs(Tiny.TokenType.LBRACE) && !short) {
            this.pushError(this.messages.parserError.invalidBodyBlock);

            return null;
        }

        if (!this.peekTokenIs(Tiny.TokenType.LBRACE)) {
            this.nextToken();

            const statement = this.parseStatement();

            if (!statement) return null;

            return {
                debug: 'parseBlockStatement>return',
                statements: [statement],
                returnFinal: true,
                kind: Tiny.ExpressionKind.Block,
                ...this.curr(),
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

        return {
            debug: 'parseBlockStatement>return',
            statements,
            returnFinal: false,
            kind: Tiny.ExpressionKind.Block,
            ...this.curr(),
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
            ...this.curr(),
        });

        while (this.peekTokenIs(Tiny.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            parameters.push({
                value: this.currToken.literal,
                kind: Tiny.ExpressionKind.Ident,
                ...this.curr(),
            });
        }

        if (this.expectPeek(Tiny.TokenType.RPAREN)) return parameters;

        return parameters;
    }

    private parseExpressionArguments(
        end: Tiny.TokenType
    ): Array<Tiny.Expression> {
        const args: Array<Tiny.Expression> = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();

            return args;
        }

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);
        if (expression) args.push(expression);

        while (this.peekTokenIs(Tiny.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const expression = this.parseExpression(Priority.LOWEST);
            if (expression) args.push(expression);
        }

        if (!this.expectPeek(end)) return args;

        return args;
    }

    private parseHash(): Tiny.HashExpression | null {
        const pairs: Array<Tiny.HashPair> = [];

        while (!this.peekTokenIs(Tiny.TokenType.RBRACE)) {
            this.nextToken();

            let key = this.parseExpression(Priority.LOWEST);

            if (key?.kind === Tiny.ExpressionKind.Ident)
                key = {
                    debug: 'parseHash>ident>key',
                    value: {
                        debug: 'parseHash>ident>key>value',
                        value: key.value,
                        kind: Tiny.LiteralKind.String,
                        ...this.curr(),
                    },
                    kind: Tiny.ExpressionKind.Literal,
                    ...this.curr(),
                };

            let value: Tiny.Expression = null;

            if (!this.peekTokenIs(Tiny.TokenType.COLON))
                value = this.parseExpression(Priority.LOWEST);
            else {
                this.nextToken();
                this.nextToken();

                value = this.parseExpression(Priority.LOWEST);
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
                ...this.curr(),
            });
        }

        if (!this.expectPeek(Tiny.TokenType.RBRACE)) return null;

        return {
            debug: 'parseHash>return',
            pairs,
            kind: Tiny.ExpressionKind.Hash,
            ...this.curr(),
        };
    }

    private peekPriority(): Priority {
        return this.getPriority(this.peekToken);
    }

    private currPriority(): Priority {
        return this.getPriority(this.currToken);
    }

    private getPriority(token: Tiny.Token): Priority {
        switch (token.type) {
            case Tiny.TokenType.AND:
            case Tiny.TokenType.OR:
                return Priority.LOGICAL;

            case Tiny.TokenType.EQUAL:
            case Tiny.TokenType.NOT_EQUAL:
            case Tiny.TokenType.ASSIGN:
                return Priority.EQUAL;

            case Tiny.TokenType.LT:
            case Tiny.TokenType.GT:
            case Tiny.TokenType.LTE:
            case Tiny.TokenType.GTE:
                return Priority.LESSGREATER;

            case Tiny.TokenType.PLUS:
            case Tiny.TokenType.MINUS:
                return Priority.SUM;

            case Tiny.TokenType.SLASH:
            case Tiny.TokenType.ASTERISK:
            case Tiny.TokenType.PERCENT:
            case Tiny.TokenType.ELEMENT:
            case Tiny.TokenType.IN:
            case Tiny.TokenType.NULLISH:
                return Priority.PRODUCT;

            case Tiny.TokenType.LPAREN:
                return Priority.CALL;

            case Tiny.TokenType.LBRACKET:
                return Priority.INDEX;

            default:
                return Priority.LOWEST;
        }
    }
}
