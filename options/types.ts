interface IOptions {
    allowEval: boolean;
    allowJavaScript: boolean;
    useStdLibAutomatically: boolean;
}

type Options = Partial<IOptions>;

export default Options;
