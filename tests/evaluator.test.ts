import test, { eq } from '.';
import { evaluator } from '../evaluator';
import { Enviroment } from '../object';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';

test('Tokenizer token test', () => {
    const lexer = new Lexer(`
let f = fn (x, y) { 
    let res = x + 2 * y; 
    res; 
};

if (f(2, 3) > 3) {
    let x = {
        "message": "hello",
        "name": "world",
        true: 18,
        "array": [1, 2, 3, false, true, "hello", "world"],
    };
    print(x)
    print(x["name"])
} else { print("X"); }

let arr = [1, 2, 3, -4, -5];
print(arr[3] + arr[4]);

if (arr[3] + arr[4] == -9) { print("Y"); }
`);

    const parser = new Parser(lexer);
    const env = new Enviroment();

    eq(evaluator(parser.parseProgram(), env), null);
});
