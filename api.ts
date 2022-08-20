import * as TinyLang from './tiny';
import Tiny from './index';
import express from 'express';

const app = express();

app.listen(5050, () => console.log('http://localhost:5050'));

app.get('/eval', (_, res) => {
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

    let playgroundTitle: string = 'Tiny playground';

    const tiny = new Tiny(req.params.code, {
        useStdLibAutomatically: true,
        allowEval: true,
        stderrPrefix: false,
        stderrColor: false,
    })
        .setStdout((x) => result.push(x))
        .setStderr((x) => errors.push(x))
        .setStdin(() => TinyLang.NULL)
        .setBuiltins(
            new Map([
                [
                    'pg_api_title',
                    (parameters: Array<TinyLang.LangObject>) => {
                        playgroundTitle =
                            (parameters[0] as TinyLang.StringObject)?.value ??
                            'Tiny playground';

                        return TinyLang.NULL;
                    },
                ],
            ])
        )
        .applyBuiltins();

    const parsed = tiny.parseProgram();

    tiny.evalProgram(parsed);

    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');

    res.json({
        result,
        errors,
        ast: parsed,
        title: playgroundTitle,
    });
});
