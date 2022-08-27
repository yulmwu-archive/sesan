import * as Sesan from '../../index'

export default class Parser {
    public currToken!: Sesan.Token
    public peekToken!: Sesan.Token
    public currLine: number = 1
    public currColumn: number = 1

    public messages: Sesan.Errors

    public errors: Array<Sesan.ParseError> = []

    constructor(public lexer: Sesan.Lexer, public option: Sesan.Options) {
        this.messages = Sesan.localization(option)

        this.nextToken()
        this.nextToken()
    }

    public parseProgram(): Sesan.Program {
        let program: Sesan.Program = {
            statements: [],
            errors: [],
        }

        while (this.currToken.type !== Sesan.TokenType.EOF) {
            const statement = this.parseStatement()
            if (statement) program.statements.push(statement)

            this.nextToken()
        }

        program.errors = this.errors

        return program
    }

    private parseStatement(): Sesan.Statement | null {
        switch (this.currToken.type) {
            case Sesan.TokenType.LET:
                return this.parseLetStatement()

            case Sesan.TokenType.RETURN:
                return this.parseReturnStatement()

            case Sesan.TokenType.WHILE:
                return this.parseWhileStatement()

            case Sesan.TokenType.AT:
                return this.parseDecorator()

            default:
                return this.parseExpressionStatement()
        }
    }

    private nextToken() {
        this.currToken = this.peekToken
        this.peekToken = this.lexer.nextToken()
        this.currLine = this.peekToken.line
        this.currColumn = this.peekToken.column
    }

    private currPos() {
        return {
            line: this.currLine,
            column: this.currColumn,
        }
    }

    private expectPeek(tokenType: Sesan.TokenType): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken()

            return true
        }

        this.pushError(Sesan.errorFormatter(this.messages.parseError.unexpectedToken, tokenType, this.peekToken.type))

        return false
    }

    private peekTokenIs(tokenType: Sesan.TokenType): boolean {
        if (tokenType === Sesan.TokenType.IDENT) {
            if (this.peekToken.type === Sesan.TokenType.IDENT) return true

            return false
        }

        return this.peekToken.type === tokenType
    }

    private currTokenIs(tokenType: Sesan.TokenType): boolean {
        return this.currToken.type === tokenType
    }

    private pushError(message: string) {
        this.errors.push({
            line: this.currLine,
            column: this.currColumn,
            message,
        })
    }

    private parseLetStatement(): Sesan.LetStatement | null {
        if (!this.expectPeek(Sesan.TokenType.IDENT)) return null

        const ident: Sesan.IdentExpression = {
            debug: 'parseLetStatement>ident',
            value: this.currToken.type === Sesan.TokenType.IDENT ? this.currToken.literal : '',
            kind: Sesan.ExpressionKind.Ident,
            ...this.currPos(),
        }

        if (!this.expectPeek(Sesan.TokenType.ASSIGN)) return null

        this.nextToken()

        const expression = this.parseExpression(Sesan.Priority.LOWEST)

        if (!this.expectPeek(Sesan.TokenType.SEMICOLON)) return null

        return {
            debug: 'parseLetStatement>return',
            ident,
            value: expression,
            kind: Sesan.NodeKind.LetStatement,
            ...this.currPos(),
        }
    }

    private parseReturnStatement(): Sesan.ReturnStatement | null {
        this.nextToken()

        const expression = this.parseExpression(Sesan.Priority.LOWEST)

        if (this.peekTokenIs(Sesan.TokenType.SEMICOLON)) this.nextToken()

        return {
            debug: 'parseReturnStatement>return',
            value: expression,
            kind: Sesan.NodeKind.ReturnStatement,
            ...this.currPos(),
        }
    }

    private parseWhileStatement(): Sesan.WhileStatement | null {
        if (!this.expectPeek(Sesan.TokenType.LPAREN)) return null

        return {
            debug: 'parseWhileStatement>return',
            condition: this.parseExpression(Sesan.Priority.LOWEST),
            body: this.parseBlockStatement(),
            kind: Sesan.NodeKind.WhileStatement,
            ...this.currPos(),
        }
    }

    private parseDecorator(): Sesan.DecoratorStatement | null {
        this.nextToken()

        const value = this.parseExpression(Sesan.Priority.LOWEST)

        this.nextToken()

        if (this.currTokenIs(Sesan.TokenType.SEMICOLON)) this.nextToken()

        const func = this.parseExpression(Sesan.Priority.LOWEST)

        if (func?.kind !== Sesan.ExpressionKind.Function) {
            this.pushError(this.messages.parseError.decoratorRequiresFunction)

            return null
        }

        return {
            debug: 'parseDecorator>return',
            value,
            function: func,
            kind: Sesan.NodeKind.DecoratorStatement,
            ...this.currPos(),
        }
    }

    private parseExpression(priority: Sesan.Priority): Sesan.Expression | null {
        let left: Sesan.Expression = this.parsePrefix()

        if (!left)
            if (!this.currTokenIs(Sesan.TokenType.SEMICOLON))
                this.pushError(Sesan.errorFormatter(this.messages.parseError.unexpectedExpression, this.currToken.type))
            else return null

        while (!this.peekTokenIs(Sesan.TokenType.SEMICOLON) && priority < this.peekPriority()) {
            this.nextToken()
            left = this.parseInfixExpression(left)
        }

        return left
    }

    private parseExpressionStatement(): Sesan.ExpressionStatement | null {
        const expression = this.parseExpression(Sesan.Priority.LOWEST)
        if (!expression) return null

        if (
            expression.kind !== Sesan.ExpressionKind.If &&
            expression.kind !== Sesan.ExpressionKind.Function &&
            !this.expectPeek(Sesan.TokenType.SEMICOLON)
        )
            return null

        return {
            debug: 'parseExpressionStatement>return',
            expression,
            kind: Sesan.NodeKind.ExpressionStatement,
            ...this.currPos(),
        }
    }

    private parsePrefix(): Sesan.Expression | null {
        switch (this.currToken.type) {
            case Sesan.TokenType.IDENT:
                return {
                    debug: 'parsePrefix>case>ident',
                    value: this.currToken.literal,
                    kind: Sesan.ExpressionKind.Ident,
                    ...this.currPos(),
                }

            case Sesan.TokenType.NUMBER:
                return {
                    debug: 'parsePrefix>case>number',
                    value: {
                        value: Number(this.currToken.literal),
                        kind: Sesan.LiteralKind.Number,
                        ...this.currPos(),
                    },
                    kind: Sesan.ExpressionKind.Literal,
                    ...this.currPos(),
                }

            case Sesan.TokenType.STRING:
                return {
                    debug: 'parsePrefix>case>string',
                    value: {
                        value: this.currToken.literal,
                        kind: Sesan.LiteralKind.String,
                        ...this.currPos(),
                    },
                    kind: Sesan.ExpressionKind.Literal,
                    ...this.currPos(),
                }

            case Sesan.TokenType.BANG:
            case Sesan.TokenType.MINUS:
                return this.prefixParseOps()

            case Sesan.TokenType.TRUE:
            case Sesan.TokenType.FALSE:
                return {
                    debug: 'parsePrefix>case>true',
                    value: {
                        value: this.currToken.type === Sesan.TokenType.TRUE,
                        kind: Sesan.LiteralKind.Boolean,
                        ...this.currPos(),
                    },
                    kind: Sesan.ExpressionKind.Literal,
                    ...this.currPos(),
                }

            case Sesan.TokenType.NULL:
                return {
                    debug: 'parsePrefix>case>null',
                    value: {
                        kind: Sesan.LiteralKind.Null,
                        ...this.currPos(),
                    },
                    kind: Sesan.ExpressionKind.Literal,
                    ...this.currPos(),
                }

            case Sesan.TokenType.LPAREN: {
                this.nextToken()

                const expression = this.parseExpression(Sesan.Priority.LOWEST)

                if (!this.expectPeek(Sesan.TokenType.RPAREN)) return null

                if (!expression) return null

                return expression
            }

            case Sesan.TokenType.IF: {
                if (!this.expectPeek(Sesan.TokenType.LPAREN)) return null

                this.nextToken()

                const condition = this.parseExpression(Sesan.Priority.LOWEST)

                if (!this.expectPeek(Sesan.TokenType.RPAREN)) return null

                const consequence = this.parseBlockStatement()

                let alternative: Sesan.Expression | null = null

                if (this.peekTokenIs(Sesan.TokenType.ELSE)) {
                    this.nextToken()

                    alternative = this.parseBlockStatement()
                }

                return {
                    debug: 'parsePrefix>case>if',
                    condition,
                    consequence,
                    alternative,
                    kind: Sesan.ExpressionKind.If,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.FUNCTION: {
                let name: Sesan.Expression | null = null

                if (!this.peekTokenIs(Sesan.TokenType.IDENT)) name = null
                else {
                    this.nextToken()

                    name = {
                        debug: 'parsePrefix>case>function>name',
                        value: this.currToken.literal,
                        kind: Sesan.ExpressionKind.Ident,
                        ...this.currPos(),
                    }
                }

                if (!this.expectPeek(Sesan.TokenType.LPAREN)) return null

                const parameters = this.parseFunctionParameters()

                const body = this.parseBlockStatement()
                if (!body) return null

                return {
                    debug: 'parsePrefix>case>function',
                    function: name,
                    parameters: parameters,
                    body,
                    kind: Sesan.ExpressionKind.Function,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.LBRACKET:
                return {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: this.parseExpressionParameters(Sesan.TokenType.RBRACKET),
                    kind: Sesan.ExpressionKind.Array,
                    ...this.currPos(),
                }

            case Sesan.TokenType.LBRACE: {
                const pairs: Array<Sesan.ObjectPair> = []

                while (!this.peekTokenIs(Sesan.TokenType.RBRACE)) {
                    this.nextToken()

                    let key = this.parseExpression(Sesan.Priority.LOWEST)

                    if (key?.kind === Sesan.ExpressionKind.Ident)
                        key = {
                            debug: 'parseHash>ident>key',
                            value: {
                                debug: 'parseHash>ident>key>value',
                                value: key.value,
                                kind: Sesan.LiteralKind.String,
                                ...this.currPos(),
                            },
                            kind: Sesan.ExpressionKind.Literal,
                            ...this.currPos(),
                        }

                    let value: Sesan.Expression = null

                    if (!this.peekTokenIs(Sesan.TokenType.COLON)) value = this.parseExpression(Sesan.Priority.LOWEST)
                    else {
                        this.nextToken()
                        this.nextToken()

                        value = this.parseExpression(Sesan.Priority.LOWEST)
                    }

                    if (!this.peekTokenIs(Sesan.TokenType.RBRACE) && !this.expectPeek(Sesan.TokenType.COMMA)) return null

                    if (key === null || value === null) continue

                    pairs.push({
                        key,
                        value,
                        ...this.currPos(),
                    })
                }

                if (!this.expectPeek(Sesan.TokenType.RBRACE)) return null

                return {
                    debug: 'parseHash>return',
                    pairs,
                    kind: Sesan.ExpressionKind.Object,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.TYPEOF: {
                this.nextToken()

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) return null

                return {
                    debug: 'parsePrefix>case>typeof',
                    value: expression,
                    kind: Sesan.ExpressionKind.Typeof,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.THROW: {
                this.nextToken()

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) return null

                return {
                    debug: 'parsePrefix>case>throw',
                    message: expression,
                    line: this.currPos().line,
                    column: this.currPos().column,
                    kind: Sesan.ExpressionKind.Throw,
                }
            }

            case Sesan.TokenType.DELETE: {
                if (!this.expectPeek(Sesan.TokenType.IDENT)) return null

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) return null

                return {
                    debug: 'parsePrefix>case>delete',
                    value: expression,
                    kind: Sesan.ExpressionKind.Delete,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.USE: {
                if (!this.expectPeek(Sesan.TokenType.STRING)) return null

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) return null

                return {
                    debug: 'parsePrefix>case>use',
                    path: expression,
                    kind: Sesan.ExpressionKind.Use,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.VOID: {
                this.nextToken()

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) this.pushError(this.messages.parseError.voidRequiresExpression)

                return {
                    debug: 'parsePrefix>case>void',
                    value: expression,
                    kind: Sesan.ExpressionKind.Void,
                    ...this.currPos(),
                }
            }

            case Sesan.TokenType.EXPR: {
                this.nextToken()

                const expression = this.parseExpression(Sesan.Priority.PREFIX)

                if (!expression) return null

                return {
                    debug: 'parsePrefix>case>expr',
                    value: expression,
                    kind: Sesan.ExpressionKind.Expr,
                    ...this.currPos(),
                }
            }

            default:
                return null
        }
    }

    private prefixParseOps(): Sesan.PrefixExpression | null {
        const operator = this.currToken

        this.nextToken()

        return {
            debug: 'prefixParseOps>return',
            operator: operator.type,
            right: this.parseExpression(Sesan.Priority.PREFIX),
            kind: Sesan.ExpressionKind.Prefix,
            ...this.currPos(),
        }
    }

    private parseInfixExpression(left: Sesan.Expression): Sesan.Expression | null {
        switch (this.currToken.type) {
            case Sesan.TokenType.LPAREN:
                return {
                    debug: 'parseInfixExpression>case>Lparen',
                    function: left,
                    parameters: this.parseExpressionParameters(Sesan.TokenType.RPAREN),
                    kind: Sesan.ExpressionKind.Call,
                    ...this.currPos(),
                }

            case Sesan.TokenType.LBRACKET: {
                this.nextToken()
                const expression = this.parseExpression(Sesan.Priority.LOWEST)

                if (!this.expectPeek(Sesan.TokenType.RBRACKET))
                    return {
                        debug: 'parseInfixExpression>case>Lbracket',
                        left,
                        index: {
                            debug: 'parseInfixExpression>case>Lbracket>index',
                            value: {
                                debug: 'parseInfixExpression>case>Lbracket>index>value',
                                value: 0,
                                kind: Sesan.LiteralKind.Number,
                                ...this.currPos(),
                            },
                            kind: Sesan.ExpressionKind.Literal,
                            ...this.currPos(),
                        },
                        kind: Sesan.ExpressionKind.Index,
                        ...this.currPos(),
                    }

                return {
                    debug: 'parseInfixExpression>case>Lbracket',
                    left,
                    index: expression,
                    kind: Sesan.ExpressionKind.Index,
                    ...this.currPos(),
                }
            }

            default: {
                const operator = this.currToken

                const priority = this.currPriority()

                this.nextToken()

                const right = this.parseExpression(priority)
                if (!right) return null

                return {
                    debug: 'parseInfixExpression>case>default',
                    left,
                    right,
                    operator: operator.type,
                    kind: Sesan.ExpressionKind.Infix,
                    ...this.currPos(),
                }
            }
        }
    }

    private parseBlockStatement(): Sesan.BlockStatement | null {
        if (!this.peekTokenIs(Sesan.TokenType.LBRACE)) {
            this.nextToken()

            const expression = this.parseExpression(Sesan.Priority.LOWEST)

            if (!expression) return null

            return {
                debug: 'parseBlockStatement>return',
                statements: [
                    {
                        debug: 'parseBlockStatement>return>statement',
                        expression,
                        kind: Sesan.NodeKind.ExpressionStatement,
                        ...this.currPos(),
                    },
                ],
                returnFinal: true,
                kind: Sesan.ExpressionKind.Block,
                ...this.currPos(),
            }
        }

        this.nextToken()

        let statements: Array<Sesan.Statement> = []

        this.nextToken()

        while (!this.currTokenIs(Sesan.TokenType.RBRACE) && !this.currTokenIs(Sesan.TokenType.EOF)) {
            const statement = this.parseStatement()
            if (statement) statements.push(statement)

            this.nextToken()
        }

        if (!this.currTokenIs(Sesan.TokenType.RBRACE)) {
            this.pushError(Sesan.errorFormatter(this.messages.parseError.unexpectedToken, Sesan.TokenType.RPAREN, this.peekToken.type))

            return null
        }

        return {
            debug: 'parseBlockStatement>return',
            statements,
            returnFinal: false,
            kind: Sesan.ExpressionKind.Block,
            ...this.currPos(),
        }
    }

    private parseFunctionParameters(): Array<Sesan.Expression> {
        let parameters: Array<Sesan.Expression> = []

        if (this.peekTokenIs(Sesan.TokenType.RPAREN)) {
            this.nextToken()

            return []
        }

        this.nextToken()

        parameters.push({
            value: this.currToken.literal,
            kind: Sesan.ExpressionKind.Ident,
            ...this.currPos(),
        })

        while (this.peekTokenIs(Sesan.TokenType.COMMA)) {
            this.nextToken()
            this.nextToken()

            parameters.push({
                value: this.currToken.literal,
                kind: Sesan.ExpressionKind.Ident,
                ...this.currPos(),
            })
        }

        if (this.expectPeek(Sesan.TokenType.RPAREN)) return parameters

        return parameters
    }

    private parseExpressionParameters(end: Sesan.TokenType): Array<Sesan.Expression> {
        const parameters: Array<Sesan.Expression> = []

        if (this.peekTokenIs(end)) {
            this.nextToken()

            return parameters
        }

        this.nextToken()

        const expression = this.parseExpression(Sesan.Priority.LOWEST)
        if (expression) parameters.push(expression)

        while (this.peekTokenIs(Sesan.TokenType.COMMA)) {
            this.nextToken()
            this.nextToken()

            const expression = this.parseExpression(Sesan.Priority.LOWEST)
            if (expression) parameters.push(expression)
        }

        if (!this.expectPeek(end)) return parameters

        return parameters
    }

    private peekPriority(): Sesan.Priority {
        return this.getPriority(this.peekToken)
    }

    private currPriority(): Sesan.Priority {
        return this.getPriority(this.currToken)
    }

    private getPriority(token: Sesan.Token): Sesan.Priority {
        switch (token.type) {
            case Sesan.TokenType.ASSIGN:
                return Sesan.Priority.ASSIGN

            case Sesan.TokenType.AND:
            case Sesan.TokenType.OR:
                return Sesan.Priority.AND_OR

            case Sesan.TokenType.EQUAL:
            case Sesan.TokenType.NOT_EQUAL:
                return Sesan.Priority.EQUAL

            case Sesan.TokenType.LT:
            case Sesan.TokenType.GT:
            case Sesan.TokenType.LTE:
            case Sesan.TokenType.GTE:
            case Sesan.TokenType.IN:
                return Sesan.Priority.LESS_GREATER

            case Sesan.TokenType.PLUS:
            case Sesan.TokenType.MINUS:
                return Sesan.Priority.SUM

            case Sesan.TokenType.SLASH:
            case Sesan.TokenType.ASTERISK:
            case Sesan.TokenType.PERCENT:
                return Sesan.Priority.PRODUCT

            case Sesan.TokenType.TYPEOF:
            case Sesan.TokenType.DELETE:
            case Sesan.TokenType.THROW:
            case Sesan.TokenType.USE:
            case Sesan.TokenType.VOID:
            case Sesan.TokenType.EXPR:
                return Sesan.Priority.PREFIX

            case Sesan.TokenType.LPAREN:
                return Sesan.Priority.CALL

            case Sesan.TokenType.LBRACKET:
            case Sesan.TokenType.ELEMENT:
            case Sesan.TokenType.IN:
            case Sesan.TokenType.NULLISH:
                return Sesan.Priority.INDEX

            default:
                return Sesan.Priority.LOWEST
        }
    }
}
