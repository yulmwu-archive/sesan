export interface IOptions {
    allowEval: boolean;
    allowJavaScript: boolean;
    useStdLibAutomatically: boolean;
    stderrPrefix: boolean;
    stderrColor: boolean;
    locale: string;
}

type Options = Partial<IOptions>;

export default Options;
