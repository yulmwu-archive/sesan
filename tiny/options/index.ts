import Options from './types';

const parseOptions = (option?: string): Options =>
    option
        ? JSON.parse(option)
        : ({
              allowEval: false,
              allowJavaScript: false,
              useStdLibAutomatically: false,
          } as Options);

export default parseOptions;
export { Options };
