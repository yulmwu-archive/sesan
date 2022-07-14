import { existsSync, readFileSync } from 'fs';
import { Enviroment } from '../object';
import Tiny, { NULL } from '../index';
import parseOptions from '../options';
import Repl from './repl';
import express from 'express';

const args = process.argv.slice(2);

const env = new Enviroment();

const option = existsSync('./tiny.config.json')
    ? parseOptions(readFileSync('./tiny.config.json').toString())
    : parseOptions();

if (args.length <= 0) new Repl(env, option).start();
else if (args[0] === '--api') {
    const app = express();

    app.listen(5050, () => console.log('http://localhost:5050'));

    app.get('/eval/:code', (req, res) => {
        const result: Array<string> = [];

        new Tiny(req.params.code, {
            useStdLibAutomatically: true,
            root: './',
        })
            .applyBuiltins()
            .setStdout((x) => result.push(x))
            .setStdin(() => NULL)
            .eval();

        res.json({
            result,
        });
    });
} else {
    try {
        const file = readFileSync(args[0], 'utf8');

        new Tiny(file, { enviroment: env, ...option }).eval();
    } catch (e) {
        console.error(`Cannot open file ${args[0]}: ${e}`);
    }
}
