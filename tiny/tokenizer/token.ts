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
    ELEMENT = 'ELEMENT',
    NULLISH = 'NULLISH',

    ASSIGN = '=',
    PLUS = '+',
    MINUS = '-',
    BANG = '!',
    ASTERISK = '*',
    SLASH = '/',
    PERCENT = '%',
    QUESTION = '?',

    LT = '<',
    GT = '>',
    LTE = '<=',
    GTE = '>=',
    EQUAL = '==',
    NOT_EQUAL = '!=',
    AND = '&&',
    OR = '||',

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
    IN = 'IN',
}

interface Token {
    type: TokenType;
    literal: string;
    line: number;
    column: number;
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

        case 'in': 
            return TokenType.IN;

        default:
            return TokenType.IDENT;
    }
};

export { TokenType, Token, fromLiteral };
