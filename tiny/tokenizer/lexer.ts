import {
    Position,
    Stdio,
    printError,
    fromLiteral,
    Token,
    TokenType,
    Options,
} from '../../index';

interface LexerStderrOptions extends Options {
    stderr: Stdio;
}

export default class Lexer {
    public position: number = 0;
    public readPosition: number = 0;
    public line: number = 1;
    public lineStart: number = 1;
    public ch: string = '';

    constructor(public input: string, public stderr: LexerStderrOptions) {
        this.readChar();
    }

    public curr(): Position {
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

    public readIdentifier(): Token {
        let position = this.position;

        if (!this.isDigit(this.ch)) {
            while (this.isLetter(this.ch) || /[0-9]/.test(this.ch))
                this.readChar();

            const literal = this.input.substring(position, this.position);

            return {
                type: fromLiteral(literal),
                literal: literal,
                ...this.curr(),
            };
        } else {
            printError(
                {
                    ...this.curr(),
                    message: 'Invalid identifier',
                },
                this.stderr.stderr,
                {
                    ...this.stderr,
                }
            );

            return {
                type: TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            };
        }
    }

    public readNumber(): Token {
        const position = this.position;

        let dot = false;

        while (this.isDigit(this.ch)) {
            if (this.ch === '.') {
                if (dot) {
                    printError(
                        {
                            ...this.curr(),
                            message: `[Lexer] Invalid number`,
                        },
                        this.stderr.stderr,
                        {
                            ...this.stderr,
                        }
                    );

                    return {
                        type: TokenType.EOF,
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
            type: TokenType.NUMBER,
            literal: this.input.substring(position, this.position),
            ...this.curr(),
        };
    }

    public readString(tok: '"' | "'"): Token {
        let position = this.position + 1;

        while (this.peekChar() !== tok && this.ch !== '\0') this.readChar();

        if (this.ch === '\0') {
            printError(
                {
                    ...this.curr(),
                    message: `[Lexer] Unterminated string: ${this.input.substring(
                        position - 1,
                        this.position
                    )}`,
                },
                this.stderr.stderr,
                {
                    ...this.stderr,
                }
            );

            return {
                type: TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            };
        }

        this.readChar();

        return {
            type: TokenType.STRING,
            literal: this.input
                .substring(position, this.position)
                .replace('\\n', '\n'),
            line: this.line,
            column: this.position - position,
        };
    }

    public skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\n' || this.ch === '\r' || this.ch === '\t') {
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

    public readComment(): Token {
        let position = this.position;

        while (this.ch !== '\0' && this.ch !== '\n') this.readChar();

        return {
            type: TokenType.COMMENT,
            literal: this.input.substring(position, this.position),
            ...this.curr(),
        };
    }

    public nextToken(): Token {
        let token: Token;

        this.skipWhitespace();

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    token = {
                        type: TokenType.EQUAL,
                        literal: `${ch}${this.ch}`,
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.ASSIGN,
                        literal: '=',
                        ...this.curr(),
                    };
                break;

            case '(':
                token = {
                    type: TokenType.LPAREN,
                    literal: '(',
                    ...this.curr(),
                };
                break;

            case ')':
                token = {
                    type: TokenType.RPAREN,
                    literal: ')',
                    ...this.curr(),
                };
                break;

            case ';':
                token = {
                    type: TokenType.SEMICOLON,
                    literal: ';',
                    ...this.curr(),
                };
                break;

            case ',':
                token = { type: TokenType.COMMA, literal: ',', ...this.curr() };
                break;

            case '+':
                token = { type: TokenType.PLUS, literal: '+', ...this.curr() };
                break;

            case '-':
                token = { type: TokenType.MINUS, literal: '-', ...this.curr() };
                break;

            case '*':
                token = {
                    type: TokenType.ASTERISK,
                    literal: '*',
                    ...this.curr(),
                };
                break;

            case '/':
                if (this.peekChar() === '/') {
                    this.readChar();
                    this.readComment();
                    token = {
                        type: TokenType.COMMENT,
                        literal: '',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.SLASH,
                        literal: '/',
                        ...this.curr(),
                    };
                break;

            case '%':
                token = {
                    type: TokenType.PERCENT,
                    literal: '%',
                    ...this.curr(),
                };
                break;

            case '!':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: TokenType.NOT_EQUAL,
                        literal: '!=',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.BANG,
                        literal: '!',
                        ...this.curr(),
                    };
                break;

            case '<':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: TokenType.LTE,
                        literal: '<=',
                        ...this.curr(),
                    };
                } else if (this.peekChar() === '-') {
                    this.readChar();
                    token = {
                        type: TokenType.ELEMENT,
                        literal: '<-',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.LT,
                        literal: '<',
                        ...this.curr(),
                    };
                break;

            case '>':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: TokenType.GTE,
                        literal: '>=',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.GT,
                        literal: '>',
                        ...this.curr(),
                    };
                break;

            case '&':
                if (this.peekChar() === '&') {
                    this.readChar();
                    token = {
                        type: TokenType.AND,
                        literal: '&&',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
                break;

            case '|':
                if (this.peekChar() === '|') {
                    this.readChar();
                    token = {
                        type: TokenType.OR,
                        literal: '||',
                        ...this.curr(),
                    };
                } else
                    token = {
                        type: TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
                break;

            case '"':
                token = this.readString('"');
                break;

            case "'":
                token = this.readString("'");
                break;

            case '{':
                token = {
                    type: TokenType.LBRACE,
                    literal: '{',
                    ...this.curr(),
                };
                break;

            case '}':
                token = {
                    type: TokenType.RBRACE,
                    literal: '}',
                    ...this.curr(),
                };
                break;

            case '[':
                token = {
                    type: TokenType.LBRACKET,
                    literal: '[',
                    ...this.curr(),
                };
                break;

            case ']':
                token = {
                    type: TokenType.RBRACKET,
                    literal: ']',
                    ...this.curr(),
                };
                break;

            case ':':
                token = { type: TokenType.COLON, literal: ':', ...this.curr() };
                break;

            case '\0':
                token = { type: TokenType.EOF, literal: 'EOF', ...this.curr() };
                break;

            default:
                if (this.isLetter(this.ch)) token = this.readIdentifier();
                else if (this.isDigit(this.ch)) token = this.readNumber();
                else
                    token = {
                        type: TokenType.ILLEGAL,
                        literal: this.ch,
                        ...this.curr(),
                    };
        }

        if (
            token.type === TokenType.LET ||
            token.type === TokenType.FUNCTION ||
            token.type === TokenType.TRUE ||
            token.type === TokenType.FALSE ||
            token.type === TokenType.IF ||
            token.type === TokenType.ELSE ||
            token.type === TokenType.RETURN ||
            token.type === TokenType.WHILE ||
            token.type === TokenType.IDENT ||
            token.type === TokenType.NUMBER
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
