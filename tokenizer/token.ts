enum TokenType {
    ILLEGAL = 'ILLEGAL',
    EOF = 'EOF',
    IDENT = 'IDENT',

    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    FUNCTION = 'FUNCTION',

    ASSIGN = '=',
    PLUS = '+',
    MINUS = '-',
    BANG = '!',
    ASTERISK = '*',
    SLASH = '/',

    LT = '<',
    GT = '>',
    EQUAL = '==',
    NOT_EQUAL = '!=',

    COMMA = ',',
    COLON = ':',
    SEMICOLON = ';',
    LPAREN = '(',
    RPAREN = ')',
    LBRACE = '{',
    RBRACE = '}',
    LBRACKET = '[',
    RBRACKET = ']',

    LET = 'LET',
    IF = 'IF',
    ELSE = 'ELSE',
    RETURN = 'RETURN',
}

interface Token {
    type: TokenType | IdentToken | NumberToken | StringToken | BooleanToken;
    literal: string | number | boolean;
}

interface IdentToken {
    value: string;
}

interface NumberToken {
    value: number;
}

interface StringToken {
    value: string;
}

interface BooleanToken {
    value: boolean;
}

const fromLiteral = (literal: string): TokenType => {
    switch (literal) {
        case 'let':
            return TokenType.LET;
        case 'fn':
            return TokenType.FUNCTION;
        case 'true':
            return TokenType.TRUE;
        case 'false':
            return TokenType.FALSE;
        case 'if':
            return TokenType.IF;
        case 'else':
            return TokenType.ELSE;
        case 'return':
            return TokenType.RETURN;
        default:
            return TokenType.IDENT;
    }
};

export {
    TokenType,
    Token,
    IdentToken,
    NumberToken,
    StringToken,
    BooleanToken,
    fromLiteral,
};
