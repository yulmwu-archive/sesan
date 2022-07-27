import * as Tiny from '../../index';

type LexerOptions = Tiny.Options & {
    stderr: Tiny.Stdio;
};

export default class Lexer {
    public position: number = 0;
    public readPosition: number = 0;
    public line: number = 1;
    public lineStart: number = 1;
    public ch: string = '';

    public messages;

    constructor(
        public input: string,
        public options: LexerOptions,
        public filename: string
    ) {
        this.messages = Tiny.localization(options);

        this.readChar();
    }

    public curr(): Tiny.Position {
        return {
            line: this.line,
            column: this.position - this.lineStart,
        };
    }

    public readChar() {
        if (this.readPosition >= this.input.length) this.ch = '\0';
        else this.ch = this.input[this.readPosition];

        this.position = this.readPosition;
        this.readPosition += 1;
    }

    public readIdentifier(): Tiny.Token {
        let position = this.position;

        if (!this.isDigit(this.ch)) {
            while (this.isLetter(this.ch) || /[0-9]/.test(this.ch))
                this.readChar();

            const literal = this.input.substring(position, this.position);

            return {
                type: Tiny.fromLiteral(literal),
                literal: literal,
                ...this.curr(),
            };
        } else {
            Tiny.printError(
                {
                    ...this.curr(),
                    message: this.messages.lexerError.invalidIdentifier,
                },
                this.filename,
                this.options.stderr,
                {
                    ...this.options,
                }
            );

            return {
                type: Tiny.TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            };
        }
    }

    public readNumber(): Tiny.Token {
        const position = this.position;

        let dot = false;

        while (this.isDigit(this.ch)) {
            if (this.ch === '.') {
                if (dot) {
                    Tiny.printError(
                        {
                            ...this.curr(),
                            message: this.messages.lexerError.invalidNumber,
                        },
                        this.filename,
                        this.options.stderr,
                        {
                            ...this.options,
                        }
                    );

                    return {
                        type: Tiny.TokenType.EOF,
                        literal: 'EOF',
                        line: this.line,
                        column: this.position - position,
                    };
                }
                dot = true;
            }

            this.readChar();
        }

        return {
            type: Tiny.TokenType.NUMBER,
            literal: this.input.substring(position, this.position),
            ...this.curr(),
        };
    }

    public readString(tok: Tiny.TokenType): Tiny.Token {
        let position = this.position + 1;

        while (this.peekChar() !== tok && this.ch !== '\0') this.readChar();

        if (this.ch === '\0') {
            Tiny.printError(
                {
                    ...this.curr(),
                    message: Tiny.errorFormatter(
                        this.messages.lexerError.invalidString,
                        this.input.substring(position - 1, this.position)
                    ),
                },
                this.filename,
                this.options.stderr,
                {
                    ...this.options,
                }
            );

            return {
                type: Tiny.TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            };
        }

        this.readChar();

        return {
            type: Tiny.TokenType.STRING,
            literal: this.input
                .substring(position, this.position)
                .replace('\\n', '\n'),
            line: this.line,
            column: this.position - position,
        };
    }

    public skipWhitespace() {
        while (
            this.ch === ' ' ||
            this.ch === '\n' ||
            this.ch === '\r' ||
            this.ch === '\t'
        ) {
            if (this.ch === '\n') {
                this.line += 1;

                this.lineStart = this.position;
            }

            this.readChar();
        }
    }

    public peekChar(): string {
        if (this.readPosition >= this.input.length) return '\0';

        return this.input[this.readPosition];
    }

    public readComment(): Tiny.Token {
        let position = this.position;

        while (this.ch !== '\0' && this.ch !== '\n') this.readChar();

        return {
            type: Tiny.TokenType.COMMENT,
            literal: this.input
                .substring(position, this.position)
                .slice(1)
                .trim(),
            ...this.curr(),
        };
    }

    public nextToken(): Tiny.Token {
        let token: Tiny.Token;

        this.skipWhitespace();

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.EQUAL,
                        literal: `${ch}${this.ch}`,
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.ASSIGN,
                        literal: '=',
                        ...this.curr(),
                    };
                break;

            case '(':
                token = {
                    type: Tiny.TokenType.LPAREN,
                    literal: '(',
                    ...this.curr(),
                };
                break;

            case ')':
                token = {
                    type: Tiny.TokenType.RPAREN,
                    literal: ')',
                    ...this.curr(),
                };
                break;

            case ';':
                token = {
                    type: Tiny.TokenType.SEMICOLON,
                    literal: ';',
                    ...this.curr(),
                };
                break;

            case ',':
                token = {
                    type: Tiny.TokenType.COMMA,
                    literal: ',',
                    ...this.curr(),
                };
                break;

            case '+':
                token = {
                    type: Tiny.TokenType.PLUS,
                    literal: '+',
                    ...this.curr(),
                };
                break;

            case '-':
                token = {
                    type: Tiny.TokenType.MINUS,
                    literal: '-',
                    ...this.curr(),
                };
                break;

            case '*':
                token = {
                    type: Tiny.TokenType.ASTERISK,
                    literal: '*',
                    ...this.curr(),
                };
                break;

            case '/':
                if (this.peekChar() === '/') {
                    this.readChar();

                    token = this.readComment();
                } else
                    token = {
                        type: Tiny.TokenType.SLASH,
                        literal: '/',
                        ...this.curr(),
                    };
                break;

            case '%':
                token = {
                    type: Tiny.TokenType.PERCENT,
                    literal: '%',
                    ...this.curr(),
                };
                break;

            case '!':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.NOT_EQUAL,
                        literal: '!=',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.BANG,
                        literal: '!',
                        ...this.curr(),
                    };
                break;

            case '<':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.LTE,
                        literal: '<=',
                        ...this.curr(),
                    };
                } else if (this.peekChar() === '-') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.ELEMENT,
                        literal: '<-',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.LT,
                        literal: '<',
                        ...this.curr(),
                    };
                break;

            case '>':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.GTE,
                        literal: '>=',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.GT,
                        literal: '>',
                        ...this.curr(),
                    };
                break;

            case '&':
                if (this.peekChar() === '&') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.AND,
                        literal: '&&',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
                break;

            case '|':
                if (this.peekChar() === '|') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.OR,
                        literal: '||',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
                break;

            case '?':
                if (this.peekChar() === '?') {
                    this.readChar();
                    token = {
                        type: Tiny.TokenType.NULLISH,
                        literal: '??',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: Tiny.TokenType.QUESTION,
                        literal: '?',
                        ...this.curr(),
                    };
                break;

            case '@':
                token = {
                    type: Tiny.TokenType.AT,
                    literal: '@',
                    ...this.curr(),
                };
                break;

            case '"':
                token = this.readString(Tiny.TokenType.QUOTE);
                break;

            case "'":
                token = this.readString(Tiny.TokenType.SINGLE_QUOTE);
                break;

            case '{':
                token = {
                    type: Tiny.TokenType.LBRACE,
                    literal: '{',
                    ...this.curr(),
                };
                break;

            case '}':
                token = {
                    type: Tiny.TokenType.RBRACE,
                    literal: '}',
                    ...this.curr(),
                };
                break;

            case '[':
                token = {
                    type: Tiny.TokenType.LBRACKET,
                    literal: '[',
                    ...this.curr(),
                };
                break;

            case ']':
                token = {
                    type: Tiny.TokenType.RBRACKET,
                    literal: ']',
                    ...this.curr(),
                };
                break;

            case ':':
                token = {
                    type: Tiny.TokenType.COLON,
                    literal: ':',
                    ...this.curr(),
                };
                break;

            case '\0':
                token = {
                    type: Tiny.TokenType.EOF,
                    literal: 'EOF',
                    ...this.curr(),
                };
                break;

            default:
                if (this.isLetter(this.ch)) token = this.readIdentifier();
                else if (this.isDigit(this.ch)) token = this.readNumber();
                else
                    token = {
                        type: Tiny.TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
        }

        if (
            token.type === Tiny.TokenType.LET ||
            token.type === Tiny.TokenType.FUNCTION ||
            token.type === Tiny.TokenType.TRUE ||
            token.type === Tiny.TokenType.FALSE ||
            token.type === Tiny.TokenType.NULL ||
            token.type === Tiny.TokenType.IF ||
            token.type === Tiny.TokenType.ELSE ||
            token.type === Tiny.TokenType.RETURN ||
            token.type === Tiny.TokenType.WHILE ||
            token.type === Tiny.TokenType.TYPEOF ||
            token.type === Tiny.TokenType.THROW ||
            token.type === Tiny.TokenType.DELETE ||
            token.type === Tiny.TokenType.USE ||
            token.type === Tiny.TokenType.IDENT ||
            token.type === Tiny.TokenType.NUMBER
        )
            return token;

        this.readChar();

        return token;
    }

    private isLetter(ch: string): boolean {
        return /[a-zA-Z]/.test(ch) || ch === '_' || ch === '@';
    }

    private isDigit(ch: string): boolean {
        return /[0-9]/.test(ch) || ch === '.';
    }
}
