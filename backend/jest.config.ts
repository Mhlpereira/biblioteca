import type { Config } from "jest";

const config: Config = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    testEnvironment: "node",

    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.ts",
        "!**/*.module.ts",
        "!**/main.ts",
        "!**/migrations/**",
        "!**/data-source.ts",
        "!**/*.dto.ts",
        "!**/*.interface.ts",
        "!**/*.entity.ts",
        "!**/node_modules/**",
    ],

    coverageDirectory: "../coverage",

    coverageThreshold: {
        global: {
            statements: 80,
            branches: 70,
            functions: 80,
            lines: 80,
        },
    },
};

export default config;
