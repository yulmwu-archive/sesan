enum TokenType {
    ILLEGAL = 'ILLEGAL',
    EOF = 'EOF',
    IDENT = 'IDENT',

    NUMBER = 'NUMBER',
    STRING = 'STRING',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    FUNCTION = 'FUNCTION',
    COMMENT = 'COMMENT',

    ASSIGN = '=',
    PLUS = '+',
    MINUS = '-',
    BANG = '!',
    ASTERISK = '*',
    SLASH = '/',
    PERCENT = '%',

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
    WHILE = 'WHILE',
}

interface Token {
    type: TokenType;
    literal: string;
}

const fromLiteral = (literal: string): TokenType => {
    switch (literal) {
        case 'let':
            return TokenType.LET;
        case 'func':
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
        case 'while':
            return TokenType.WHILE;
        default:
            return TokenType.IDENT;
    }
};

export { TokenType, Token, fromLiteral };
