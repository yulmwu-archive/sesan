import { readFileSync } from 'fs';
import { evaluator, printError } from './evaluator';
import { Enviroment, ObjectKind } from './object';
import { Parser } from './parser';
import { Lexer } from './tokenizer';
import Repl from './repl';

const args = process.argv.slice(2);

const env = new Enviroment();

if (args.length <= 0) new Repl(env).start();
else {
    try {
        const file = readFileSync(args[0], 'utf8');

        const parser = new Parser(new Lexer(file));

        const result = evaluator(parser.parseProgram(), env);

        if (parser.errors.length > 0)
            parser.errors.forEach((error) => printError(error));

        if (result?.kind === ObjectKind.ERROR) printError(result.message);
        else console.log(result);
    } catch (e) {
        console.error('Cannot open file: ' + args[0]);
    }
}
