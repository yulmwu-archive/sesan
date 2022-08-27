import * as Sesan from '../../index'

export interface LexerOptions extends Sesan.Options {
    stderr: Sesan.Stdio
}

export interface TokenCheck {
    curr: string
    next?: string
    tokenType?: Sesan.TokenType
    token?: Sesan.Token
    readChar?: boolean
    stringToken?: Sesan.TokenType.QUOTE | Sesan.TokenType.SINGLE_QUOTE
    commentToken?: Sesan.TokenType.COMMENT
}
