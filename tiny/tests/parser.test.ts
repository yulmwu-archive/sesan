import test, { eq } from '.';
import { stdout } from '../../index';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';

const parse = (input: string) => new Parser(new Lexer(input, stdout)).parseProgram();

test('Parser test', () => {
    const expected = {
        statements: [
            {
                debug: 'parseLetStatement>return',
                ident: {
                    debug: 'parseLetStatement>ident',
                    value: 'xxxx',
                    kind: 7,
                },
                value: {
                    debug: 'parsePrefix>case>function',
                    arguments: [
                        { value: 'x', kind: 7 },
                        { value: 'y', kind: 7 },
                    ],
                    body: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseReturnStatement>return',
                                value: {
                                    debug: 'parseHash>return',
                                    pairs: [
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>ident',
                                                value: 'a',
                                                kind: 7,
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>number',
                                                value: { value: 1, kind: 201 },
                                                kind: 0,
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>ident',
                                                value: 'b',
                                                kind: 7,
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>false',
                                                value: {
                                                    value: false,
                                                    kind: 202,
                                                },
                                                kind: 0,
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'c',
                                                    kind: 200,
                                                },
                                                kind: 0,
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'hello',
                                                    kind: 200,
                                                },
                                                kind: 0,
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'd',
                                                    kind: 200,
                                                },
                                                kind: 0,
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>Lbracket',
                                                elements: [
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 1,
                                                            kind: 201,
                                                        },
                                                        kind: 0,
                                                    },
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 2,
                                                            kind: 201,
                                                        },
                                                        kind: 0,
                                                    },
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 3,
                                                            kind: 201,
                                                        },
                                                        kind: 0,
                                                    },
                                                ],
                                                kind: 8,
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>number',
                                                value: { value: 10, kind: 201 },
                                                kind: 0,
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'ten',
                                                    kind: 200,
                                                },
                                                kind: 0,
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'e',
                                                    kind: 200,
                                                },
                                                kind: 0,
                                            },
                                            value: {
                                                debug: 'parseHash>return',
                                                pairs: [
                                                    {
                                                        key: {
                                                            debug: 'parsePrefix>case>ident',
                                                            value: 'f',
                                                            kind: 7,
                                                        },
                                                        value: {
                                                            debug: 'parsePrefix>case>Lbracket',
                                                            elements: [
                                                                {
                                                                    debug: 'parsePrefix>case>string',
                                                                    value: {
                                                                        value: 'hello',
                                                                        kind: 200,
                                                                    },
                                                                    kind: 0,
                                                                },
                                                                {
                                                                    debug: 'parsePrefix>case>string',
                                                                    value: {
                                                                        value: 'world',
                                                                        kind: 200,
                                                                    },
                                                                    kind: 0,
                                                                },
                                                            ],
                                                            kind: 8,
                                                        },
                                                    },
                                                    {
                                                        key: {
                                                            debug: 'parsePrefix>case>ident',
                                                            value: 'g',
                                                            kind: 7,
                                                        },
                                                        value: {
                                                            debug: 'parsePrefix>case>true',
                                                            value: {
                                                                value: true,
                                                                kind: 202,
                                                            },
                                                            kind: 0,
                                                        },
                                                    },
                                                ],
                                                kind: 10,
                                            },
                                        },
                                    ],
                                    kind: 10,
                                },
                                kind: 102,
                            },
                        ],
                        kind: 1,
                    },
                    kind: 5,
                },
                kind: 101,
            },
            {
                debug: 'parseLetStatement>return',
                ident: {
                    debug: 'parseLetStatement>ident',
                    value: 'x',
                    kind: 7,
                },
                value: {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: [
                        {
                            debug: 'parsePrefix>case>number',
                            value: { value: 1, kind: 201 },
                            kind: 0,
                        },
                        {
                            debug: 'parsePrefix>case>number',
                            value: { value: 2, kind: 201 },
                            kind: 0,
                        },
                        {
                            debug: 'parsePrefix>case>number',
                            value: { value: 3, kind: 201 },
                            kind: 0,
                        },
                    ],
                    kind: 8,
                },
                kind: 101,
            },
            {
                debug: 'parseExpressionStatement>return',
                expression: {
                    debug: 'parsePrefix>case>if',
                    condition: {
                        debug: 'parseInfixExpression>case>default',
                        left: {
                            debug: 'parsePrefix>case>ident',
                            value: 'x',
                            kind: 7,
                        },
                        operator: '<',
                        right: {
                            debug: 'parsePrefix>case>number',
                            value: { value: 10, kind: 201 },
                            kind: 0,
                        },
                        kind: 3,
                    },
                    consequence: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>ident',
                                    value: 'x',
                                    kind: 7,
                                },
                                kind: 103,
                            },
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>string',
                                    value: { value: 'hello', kind: 200 },
                                    kind: 0,
                                },
                                kind: 103,
                            },
                        ],
                        kind: 1,
                    },
                    alternative: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>ident',
                                    value: 'x',
                                    kind: 7,
                                },
                                kind: 103,
                            },
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>false',
                                    value: { value: false, kind: 202 },
                                    kind: 0,
                                },
                                kind: 103,
                            },
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parseInfixExpression>case>Lparen',
                                    function: {
                                        debug: 'parsePrefix>case>ident',
                                        value: 'aaa',
                                        kind: 7,
                                    },
                                    arguments: [
                                        {
                                            debug: 'parsePrefix>case>ident',
                                            value: 'a',
                                            kind: 7,
                                        },
                                        {
                                            debug: 'parsePrefix>case>number',
                                            value: { value: 10, kind: 201 },
                                            kind: 0,
                                        },
                                    ],
                                    kind: 6,
                                },
                                kind: 103,
                            },
                        ],
                        kind: 1,
                    },
                    kind: 4,
                },
                kind: 103,
            },
        ],
    };

    eq(
        parse(`
let xxxx = func (x, y) {
    return {
        a: 1,
        b: false,
        "c": "hello",
        "d": [1, 2, 3],
        10: "ten",
        "e": {
            f: ["hello", "world"],
            g: true
        }
    };
};

let x = [1, 2, 3];

if (x < 10) {
    x = "hello";
} else {
    x = false;
    aaa(a, 10);
}
      `),
        expected
    );
});
