jest.mock("#postgres/knex.js", () => ({ default: {} }));
jest.mock("#config/env/env.js", () => ({ default: { WB_API_TOKEN: "test" } }));

import { parseDecimal, todayStr } from "#services/wb.js";

describe("parseDecimal", () => {
    it("returns null for undefined and empty string", () => {
        expect(parseDecimal(undefined)).toBeNull();
        expect(parseDecimal("")).toBeNull();
    });

    it("parses integer string", () => {
        expect(parseDecimal("48")).toBe(48);
        expect(parseDecimal("0")).toBe(0);
    });

    it("parses decimal with dot", () => {
        expect(parseDecimal("11.2")).toBe(11.2);
    });

    it("parses decimal with comma", () => {
        expect(parseDecimal("11,2")).toBe(11.2);
    });

    it("returns null for invalid string", () => {
        expect(parseDecimal("abc")).toBeNull();
    });
});

describe("todayStr", () => {
    it("returns YYYY-MM-DD format", () => {
        const s = todayStr();
        expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns 10 characters", () => {
        expect(todayStr()).toHaveLength(10);
    });
});
