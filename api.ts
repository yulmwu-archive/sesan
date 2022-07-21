import { readdirSync } from 'fs';
import { NULL } from './tiny/evaluator';
import Tiny, { ObjectKind } from './index';
import express from 'express';

const app = express();

app.listen(5050, () => console.log('http://localhost:5050'));

app.get('/eval', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');

    res.json({
        result: [],
        errors: [],
    });
});

app.get('/eval/:code', (req, res) => {
    const result: Array<string> = [];
    const errors: Array<string> = [];

    new Tiny(req.params.code, {
        useStdLibAutomatically: true,
        allowEval: true,
        stderrPrefix: false,
        stderrColor: false,
    })
        .setStdout((x) => result.push(x))
        .setStderr((x) => errors.push(x))
        .setStdin(() => NULL)
        .eval();

    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');

    res.json({
        result,
        errors,
    });
});
