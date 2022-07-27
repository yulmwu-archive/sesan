enum TokenType {
    ILLEGAL = 'ILLEGAL',
    EOF = 'EOF',
    IDENT = 'IDENT',

    NUMBER = 'NUMBER',
    STRING = 'STRING',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    NULL = 'NULL',
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
    AT = '@',
    QUOTE = '"',
    SINGLE_QUOTE = "'",

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
    TYPEOF = 'TYPEOF',
    THROW = 'THROW',
    DELETE = 'DELETE',
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

        case 'null':
            return TokenType.NULL;

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

        case 'typeof':
            return TokenType.TYPEOF;

        case 'throw':
            return TokenType.THROW;

        case 'delete':
            return TokenType.DELETE;

        default:
            return TokenType.IDENT;
    }
};

export { TokenType, Token, fromLiteral };
