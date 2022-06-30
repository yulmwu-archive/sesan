import { Lexer, Token, TokenType } from '../tokenizer';
import {
    BlockStatement,
    Expression,
    ExpressionStatement,
    HashExpression,
    HashPair,
    IdentExpression,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from './types';

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

const defaultToken = { type: TokenType.ILLEGAL, literal: '' };

export default class Parser {
    public currToken: Token = defaultToken;
    public peekToken: Token = defaultToken;
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

    public parseStatement(): Statement | null {
        console.log(this.currToken.type);
        switch (this.currToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    public nextToken() {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    public expectPeek(tokenType: TokenType): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();
            return true;
        }
        this.peekError(tokenType);
        return false;
    }

    public peekTokenIs(tokenType: TokenType): boolean {
        return this.peekToken.type === tokenType;
    }

    public peekError(tokenType: TokenType) {
        this.errors.push(
            `Expected next token to be ${tokenType}, got ${this.peekToken.type} instead.`
        );
    }

    public parseLetStatement(): LetStatement | null {
        console.log('parseLetStatement');
        if (
            !this.expectPeek(TokenType.IDENT) ||
            !this.expectPeek(TokenType.ASSIGN)
        )
            return null;

        const ident: IdentExpression = {
            debug: 'parseLetStatement>ident',
            value: this.currToken.literal,
        };

        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseLetStatement>return',
            ident,
            value: expression,
        };
    }

    public parseReturnStatement(): ReturnStatement | null {
        console.log('parseReturnStatement');
        this.nextToken();

        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseReturnStatement>return',
            value: expression,
        };
    }

    public parseExpression(priority: Priority): Expression | null {
        const pp = this.parsePrefix();
        if (!pp) return null;
        let left: Expression = pp;

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            priority < this.peekPriority()
        ) {
            this.nextToken();
            left = this.parseInfixExpression(left);
        }

        return left;
    }

    public parseExpressionStatement(): ExpressionStatement | null {
        console.log('parseExpressionStatement');
        const expression = this.parseExpression(Priority.LOWEST);

        if (!this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken();

        return {
            debug: 'parseExpressionStatement>return',
            expression,
        };
    }

    public parsePrefix(): Expression | null {
        switch (this.currToken.type) {
            case TokenType.IDENT:
                return {
                    debug: 'parsePrefix>case>ident',
                    value: this.currToken.literal,
                };
            case TokenType.NUMBER:
                return {
                    debug: 'parsePrefix>case>number',
                    value: this.currToken.literal,
                };
            case TokenType.STRING:
                return {
                    debug: 'parsePrefix>case>string',
                    value: this.currToken.literal,
                };
            case TokenType.BANG:
                return this.prefixParseOps();
            case TokenType.MINUS:
                return this.prefixParseOps();
            case TokenType.BOOLEAN:
                return {
                    debug: 'parsePrefix>case>boolean',
                    value: {
                        debug: 'parsePrefix>case>boolean>value',
                        value: this.currToken.literal,
                    },
                };
            case TokenType.LPAREN: {
                this.nextToken();
                const expression = this.parseExpression(Priority.LOWEST);
                if (!this.expectPeek(TokenType.RPAREN)) return null;
                return expression;
            }
            case TokenType.IF: {
                if (
                    !this.expectPeek(TokenType.LPAREN) ||
                    !this.expectPeek(TokenType.RPAREN) ||
                    !this.expectPeek(TokenType.LBRACE)
                )
                    return null;

                const condition = this.parseExpression(Priority.LOWEST);

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
                };
            }
            case TokenType.FUNCTION: {
                if (
                    !this.expectPeek(TokenType.LPAREN) ||
                    !this.expectPeek(TokenType.LBRACE)
                )
                    return null;

                const parameters = this.parseFunctionParameters();
                const body = this.parseBlockStatement();
                if (!body) process.exit(1);

                return {
                    debug: 'parsePrefix>case>function',
                    arguments: parameters,
                    body: body,
                };
            }
            case TokenType.LBRACKET:
                return {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: this.parseExpressionArguments(TokenType.LBRACKET),
                };
            case TokenType.LBRACE:
                return this.parseHash();
            default:
                return null;
        }
    }

    public prefixParseOps(): PrefixExpression | null {
        this.nextToken();
        return {
            debug: 'prefixParseOps>return',
            operator: this.currToken.type,
            right: this.parseExpression(Priority.PREFIX),
        };
    }

    public parseInfixExpression(left: Expression): Expression | null {
        switch (this.currToken.type) {
            case TokenType.LPAREN:
                return {
                    debug: 'parseInfixExpression>case>Lparen',
                    function: left,
                    arguments: this.parseExpressionArguments(TokenType.LPAREN),
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
                            },
                        },
                    };
                return {
                    debug: 'parseInfixExpression>case>Lbracket',
                    left,
                    index: expression,
                };
            }
            default: {
                this.nextToken();
                return {
                    debug: 'parseInfixExpression>case>default',
                    left,
                    right: this.parseExpression(this.curPriority()),
                    operator: this.currToken.type,
                };
            }
        }
    }

    public parseBlockStatement(): BlockStatement | null {
        let statements: Array<Statement> = [];
        this.nextToken();
        while (
            !this.peekTokenIs(TokenType.RBRACE) &&
            !this.peekTokenIs(TokenType.EOF)
        ) {
            const statement = this.parseStatement();
            if (statement) statements.push(statement);
            this.nextToken();
        }
        return {
            debug: 'parseBlockStatement>return',
            statements,
        };
    }

    public parseFunctionParameters(): Array<Expression> {
        const ret: Array<Expression> = [];

        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return ret;
        }
        this.nextToken();
        ret.push({
            debug: 'parseFunctionParameters>res.push',
            value: this.currToken.literal,
        });

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            ret.push({
                debug: 'parseFunctionParameters>while>res.push',
                value: this.currToken.literal,
            });
        }

        return ret;
    }

    public parseExpressionArguments(end: TokenType): Array<Expression> {
        const args: Array<Expression> = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();
            return args;
        }

        args.push(this.parseExpression(Priority.LOWEST));

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Priority.LOWEST));
        }

        return args;
    }

    public parseHash(): HashExpression | null {
        const pairs: Array<HashPair> = [];

        while (!this.peekTokenIs(TokenType.RBRACE)) {
            this.nextToken();

            const key = this.parseExpression(Priority.LOWEST);

            if (!this.expectPeek(TokenType.COLON)) return null;

            this.nextToken();
            const value = this.parseExpression(Priority.LOWEST);

            if (
                !this.expectPeek(TokenType.RBRACE) &&
                !this.expectPeek(TokenType.COMMA)
            )
                return null;

            pairs.push({
                debug: 'parseHash>pairs.push',
                key,
                value,
            });
        }

        if (!this.expectPeek(TokenType.RBRACE)) return null;

        return {
            debug: 'parseHash>return',
            pairs,
        };
    }

    public peekPriority(): Priority {
        return this.getPriority(this.peekToken);
    }

    public curPriority(): Priority {
        return this.getPriority(this.currToken);
    }

    public getPriority(token: Token): Priority {
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
