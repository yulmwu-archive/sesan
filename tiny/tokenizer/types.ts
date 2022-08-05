import * as Tiny from '../../index';

interface LexerOptions extends Tiny.Options {
    stderr: Tiny.Stdio;
}

interface TokenCheck {
    curr: string;
    next?: string;
    tokenType?: Tiny.TokenType;
    token?: Tiny.Token;
    readChar?: boolean;
    stringToken?: Tiny.TokenType.QUOTE | Tiny.TokenType.SINGLE_QUOTE;
    commentToken?: Tiny.TokenType.COMMENT;
}

export { LexerOptions, TokenCheck };
