import { printError } from '../evaluator';
import { fromLiteral, Token, TokenType } from './token';

export default class Lexer {
    public input: string;
    public position: number = 0;
    public readPosition: number = 0;
    public ch: string = '';

    constructor(input: string) {
        this.input = input;
        this.readChar();
    }

    public readChar() {
        if (this.readPosition >= this.input.length) this.ch = '\0';
        else this.ch = this.input[this.readPosition];

        this.position = this.readPosition;
        this.readPosition += 1;
    }

    public readIdentifier(): Token {
        let position = this.position;

        while (this.isLetter(this.ch)) this.readChar();

        const literal = this.input.substring(position, this.position);

        return {
            type: fromLiteral(literal),
            literal: literal,
        };
    }

    public readNumber(): Token {
        const position = this.position;

        while (this.isDigit(this.ch)) this.readChar();

        return {
            type: TokenType.NUMBER,
            literal: this.input.substring(position, this.position),
        };
    }

    public readString(tok: '"' | "'"): Token {
        let position = this.position + 1;

        while (this.peekChar() !== tok && this.ch !== '\0') this.readChar();

        if (this.ch === '\0') {
            printError(
                `[Lexer] Unterminated string: ${this.input.substring(
                    position - 1,
                    this.position
                )}`
            );
            return {
                type: TokenType.EOF,
                literal: 'EOF',
            };
        }

        this.readChar();

        return {
            type: TokenType.STRING,
            literal: this.input.substring(position, this.position),
        };
    }

    public skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\n' || this.ch === '\r')
            this.readChar();
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
                    };
                } else
                    token = {
                        type: TokenType.ASSIGN,
                        literal: '=',
                    };
                break;

            case '(':
                token = { type: TokenType.LPAREN, literal: '(' };
                break;
            case ')':
                token = { type: TokenType.RPAREN, literal: ')' };
                break;
            case ';':
                token = { type: TokenType.SEMICOLON, literal: ';' };
                break;
            case ',':
                token = { type: TokenType.COMMA, literal: ',' };
                break;
            case '+':
                token = { type: TokenType.PLUS, literal: '+' };
                break;
            case '-':
                token = { type: TokenType.MINUS, literal: '-' };
                break;
            case '*':
                token = { type: TokenType.ASTERISK, literal: '*' };
                break;
            case '/':
                if (this.peekChar() === '/') {
                    this.readChar();
                    this.readComment();
                    token = {
                        type: TokenType.COMMENT,
                        literal: '',
                    };
                } else token = { type: TokenType.SLASH, literal: '/' };
                break;
            case '!':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = {
                        type: TokenType.NOT_EQUAL,
                        literal: '!=',
                    };
                } else
                    token = {
                        type: TokenType.BANG,
                        literal: '!',
                    };
                break;
            case '<':
                token = { type: TokenType.LT, literal: '<' };
                break;
            case '>':
                token = { type: TokenType.GT, literal: '>' };
                break;
            case '"':
                token = this.readString('"');
                break;
            case "'":
                token = this.readString("'");
                break;
            case '{':
                token = { type: TokenType.LBRACE, literal: '{' };
                break;
            case '}':
                token = { type: TokenType.RBRACE, literal: '}' };
                break;
            case '[':
                token = { type: TokenType.LBRACKET, literal: '[' };
                break;
            case ']':
                token = { type: TokenType.RBRACKET, literal: ']' };
                break;
            case ':':
                token = { type: TokenType.COLON, literal: ':' };
                break;
            case '\0':
                token = { type: TokenType.EOF, literal: 'EOF' };
                break;

            default:
                if (this.isLetter(this.ch)) token = this.readIdentifier();
                else if (this.isDigit(this.ch)) token = this.readNumber();
                else token = { type: TokenType.ILLEGAL, literal: this.ch };
        }
        if (
            token.type === TokenType.LET ||
            token.type === TokenType.FUNCTION ||
            token.type === TokenType.TRUE ||
            token.type === TokenType.FALSE ||
            token.type === TokenType.IF ||
            token.type === TokenType.ELSE ||
            token.type === TokenType.RETURN ||
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
        return /[0-9]/.test(ch);
    }
}
