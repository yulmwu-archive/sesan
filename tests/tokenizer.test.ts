import test, { eq } from '.';
import { Lexer } from '../tokenizer';

test('Tokenizer token test', () => {
    const expected = [
        { type: 'LET', literal: 'let' },
        { type: 'IDENT', literal: 'five' },
        { type: '=', literal: '=' },
        { type: 'NUMBER', literal: 5 },
        { type: ';', literal: ';' },
        { type: 'LET', literal: 'let' },
        { type: 'IDENT', literal: 'y' },
        { type: '=', literal: '=' },
        { type: 'STRING', literal: 'I am a string' },
        { type: ';', literal: ';' },
        { type: '[', literal: '[' },
        { type: 'NUMBER', literal: 10 },
        { type: ',', literal: ',' },
        { type: 'NUMBER', literal: 2 },
        { type: ',', literal: ',' },
        { type: 'NUMBER', literal: 3 },
        { type: ']', literal: ']' },
        { type: ';', literal: ';' },
        { type: ';', literal: ';' },
        { type: ';', literal: ';' },
        { type: 'LET', literal: 'let' },
        { type: 'IDENT', literal: 'dict' },
        { type: '=', literal: '=' },
        { type: '{', literal: '{' },
        { type: 'STRING', literal: 'key' },
        { type: ':', literal: ':' },
        { type: 'STRING', literal: 'value' },
        { type: ',', literal: ',' },
        { type: 'STRING', literal: 'key2' },
        { type: ':', literal: ':' },
        { type: 'STRING', literal: 'value2' },
        { type: ',', literal: ',' },
        { type: '}', literal: '}' },
        { type: ';', literal: ';' },
    ];

    const lexer = new Lexer(`
        let five = 5;
        let y = "I am a string";
        [10, 2, 3];;;
        let dict = {
            "key": "value",
            "key2": "value2",
        };
    `);

    expected.forEach((expected) => eq(lexer.nextToken(), expected));
});
