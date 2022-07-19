import Options, { IOptions } from './types';

const parseOptions = (option?: string): Options =>
    option
        ? { ...JSON.parse(option), ...parseOptions() }
        : ({
              allowEval: false,
              allowJavaScript: false,
              useStdLibAutomatically: false,
              stderrPrefix: true,
              stderrColor: true,
          } as IOptions);

export default parseOptions;
export { Options };
