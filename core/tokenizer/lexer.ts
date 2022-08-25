import * as Tiny from '../../index'

export default class Lexer {
    public position: number = 0
    public readPosition: number = 0
    public ch: string = ''

    public column: number = 0
    public line: number = 1
    public lineStart: number = 1

    public messages: Tiny.Errors

    constructor(public input: string, public options: Tiny.LexerOptions, public filename: string) {
        this.messages = Tiny.localization(options)

        this.readChar()
    }

    public curr(): Tiny.Position {
        return {
            line: this.line,
            column: this.column - this.lineStart,
        }
    }

    public readChar() {
        if (this.readPosition >= this.input.length) this.ch = '\0'
        else this.ch = this.input[this.readPosition]

        this.position = this.readPosition
        this.readPosition += 1

        this.column += 1
    }

    public readIdentifier(): Tiny.Token {
        let position = this.position

        if (!this.isDigit(this.ch)) {
            while (this.isLetter(this.ch) || /[0-9]/.test(this.ch)) this.readChar()

            const literal = this.input.substring(position, this.position)

            return {
                type: Tiny.fromLiteral(literal),
                literal: literal,
                ...this.curr(),
            }
        } else {
            Tiny.printError(
                {
                    ...this.curr(),
                    message: this.messages.parseError.invalidIdentifier,
                },
                this.filename,
                this.options.stderr,
                {
                    ...this.options,
                }
            )

            return {
                type: Tiny.TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            }
        }
    }

    public readNumber(): Tiny.Token {
        const position = this.position

        let float = false

        while (this.isDigit(this.ch)) {
            if (this.ch === '.') {
                if (float) {
                    Tiny.printError(
                        {
                            ...this.curr(),
                            message: this.messages.parseError.invalidNumber,
                        },
                        this.filename,
                        this.options.stderr,
                        {
                            ...this.options,
                        }
                    )

                    return {
                        type: Tiny.TokenType.EOF,
                        literal: 'EOF',
                        ...this.curr(),
                    }
                }
                float = true
            }

            this.readChar()
        }

        return {
            type: Tiny.TokenType.NUMBER,
            literal: this.input.substring(position, this.position),
            ...this.curr(),
        }
    }

    private replaceAll(str: string, ...args: Array<Record<'find' | 'replace', string>>) {
        return args.reduce((acc, curr) => acc.replaceAll(curr.find, curr.replace), str)
    }

    public readString(tok: Tiny.TokenType): Tiny.Token {
        let position = this.position + 1

        while (this.peekChar() !== tok && this.ch !== '\0') this.readChar()

        if (this.ch === '\0') {
            Tiny.printError(
                {
                    ...this.curr(),
                    message: Tiny.errorFormatter(this.messages.parseError.invalidString, this.input.substring(position - 1, this.position)),
                },
                this.filename,
                this.options.stderr,
                {
                    ...this.options,
                }
            )

            return {
                type: Tiny.TokenType.EOF,
                literal: 'EOF',
                ...this.curr(),
            }
        }

        this.readChar()

        return {
            type: Tiny.TokenType.STRING,
            literal: this.replaceAll(
                this.input.substring(position, this.position),
                { find: '\\"', replace: '"' },
                { find: "\\'", replace: "'" },
                { find: '\\\\', replace: '\\' },
                { find: '\\0', replace: '\0' },
                { find: '\\b', replace: '\b' },
                { find: '\\f', replace: '\f' },
                { find: '\\v', replace: '\v' },
                { find: '\\n', replace: '\n' },
                { find: '\\r', replace: '\r' },
                { find: '\\t', replace: '\t' }
            ),
            ...this.curr(),
        }
    }

    public skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\n' || this.ch === '\r' || this.ch === '\t') {
            if (this.ch === '\n') {
                this.line += 1

                this.lineStart = this.column
            }

            this.readChar()
        }
    }

    public peekChar(): string {
        if (this.readPosition >= this.input.length) return '\0'

        return this.input[this.readPosition]
    }

    public readComment(): Tiny.Token {
        let position = this.position

        while (this.ch !== '\0' && this.ch !== '\n') this.readChar()

        this.line += 1

        return {
            type: Tiny.TokenType.COMMENT,
            literal: this.input.substring(position, this.position).slice(1).trim(),
            ...this.curr(),
        }
    }

    public checkToken(token: string, next?: string | null): boolean {
        if (this.ch === token && !next) return true

        if (this.ch === token && this.peekChar() === next) {
            this.readChar()

            return true
        }

        return false
    }

    public check(tests: Array<Readonly<Tiny.TokenCheck>>): Tiny.Token {
        for (const test of tests) {
            if (this.checkToken(test.curr, test.next ?? null)) {
                let token: Tiny.Token = {
                    type: Tiny.TokenType.ILLEGAL,
                    literal: this.ch,
                    ...this.curr(),
                }

                if (test.tokenType)
                    token = {
                        type: test.tokenType,
                        literal: this.ch,
                        ...this.curr(),
                    }
                else if (test.stringToken) token = this.readString(test.stringToken)
                else if (test.commentToken) token = this.readComment()
                else if (test.token) token = test.token

                if (test.readChar) this.readChar()

                return token
            }
        }

        return {
            type: Tiny.TokenType.ILLEGAL,
            literal: this.ch,
            ...this.curr(),
        }
    }

    public nextToken(): Tiny.Token {
        let token: Tiny.Token

        this.skipWhitespace()

        token = this.check(Tiny.tokens)

        if (token.type === Tiny.TokenType.COMMENT) return this.nextToken()

        if (token.type === Tiny.TokenType.ILLEGAL) {
            if (this.isLetter(this.ch)) token = this.readIdentifier()
            else if (this.isDigit(this.ch)) token = this.readNumber()
            else {
                token = {
                    type: Tiny.TokenType.ILLEGAL,
                    literal: this.ch,
                    ...this.curr(),
                }

                this.readChar()
            }

            return token
        }

        this.readChar()

        return token
    }

    private isLetter(ch: string): boolean {
        return /[a-zA-Z]|_/g.test(ch)
    }

    private isDigit(ch: string): boolean {
        return /[\d]|\./g.test(ch)
    }
}
