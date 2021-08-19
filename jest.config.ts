import type { Config } from '@jest/types';

const cfg: Config.InitialOptions = {
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testEnvironment: 'node',
}

export default cfg;
