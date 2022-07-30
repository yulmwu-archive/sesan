import Options, { IOptions } from './types';

const parseOptions = (option?: string): Options =>
    option
        ? { ...parseOptions(), ...JSON.parse(option) }
        : ({
              allowEval: false,
              allowJavaScript: false,
              useStdLibAutomatically: false,
              stderrPrefix: true,
              stderrColor: true,
              strictMode: false,
              locale: 'en',
          } as IOptions);

export { Options, parseOptions };
