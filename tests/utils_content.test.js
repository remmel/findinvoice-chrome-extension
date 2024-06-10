import { parseDateI18n } from "../src/suppliers/utils_content.js";

describe('parseDateI18n', () => {
    test('should correctly parse dates in different languages', () => {
        expect(parseDateI18n('7 mag 2024')).toBe('2024-05-07')
        expect(parseDateI18n('1 abr, 2024')).toBe('2024-04-01')
        expect(parseDateI18n('7 de enero de 2024')).toBe('2024-01-07')
    });

    test('should correctly parse dates in English', () => {
        expect(parseDateI18n('May 7, 2024')).toBe('2024-05-07')
        expect(parseDateI18n('Mar 29, 2024')).toBe('2024-03-29')
    });

    test('should handle invalid date strings gracefully', () => {
        expect(parseDateI18n('invalid date')).toBe('NaN-NaN-NaN')
    });
});
