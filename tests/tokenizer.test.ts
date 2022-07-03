import test, { eq } from '.';
import { Lexer } from '../tokenizer';

test('Tokenizer token test', () => {
    const expected = [
        { type: 'LET', literal: 'let' },
        { type: 'IDENT', literal: 'x' },
        { type: '=', literal: '=' },
        { type: '{', literal: '{' },
        { type: 'IDENT', literal: 'a' },
        { type: ':', literal: ':' },
        { type: 'NUMBER', literal: '1' },
        { type: ',', literal: ',' },
        { type: 'IDENT', literal: 'b' },
        { type: ':', literal: ':' },
        { type: 'FALSE', literal: 'false' },
        { type: ',', literal: ',' },
        { type: 'STRING', literal: 'c' },
        { type: ':', literal: ':' },
        { type: 'STRING', literal: 'hello' },
        { type: ',', literal: ',' },
        { type: 'STRING', literal: 'd' },
        { type: ':', literal: ':' },
        { type: '[', literal: '[' },
        { type: 'NUMBER', literal: '1' },
        { type: ',', literal: ',' },
        { type: 'NUMBER', literal: '2' },
        { type: ',', literal: ',' },
        { type: 'NUMBER', literal: '3' },
        { type: ']', literal: ']' },
        { type: ',', literal: ',' },
        { type: '}', literal: '}' },
        { type: ';', literal: ';' },
        { type: 'EOF', literal: 'EOF' },
    ];

    const lexer = new Lexer(`
let x = {
    a: 1,
    b: false,
    "c": 'hello',
    "d": [1, 2, 3],
};
    `);

    expected.forEach((expected) => eq(lexer.nextToken(), expected));
});
