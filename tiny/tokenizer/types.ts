import * as Tiny from '../../index'

export interface LexerOptions extends Tiny.Options {
    stderr: Tiny.Stdio
}

export interface TokenCheck {
    curr: string
    next?: string
    tokenType?: Tiny.TokenType
    token?: Tiny.Token
    readChar?: boolean
    stringToken?: Tiny.TokenType.QUOTE | Tiny.TokenType.SINGLE_QUOTE
    commentToken?: Tiny.TokenType.COMMENT
}
