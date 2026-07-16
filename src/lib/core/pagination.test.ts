import { describe, expect, it } from 'vitest';

import { getPageAfterDelete } from './pagination';

describe('getPageAfterDelete', () => {
    it('删除非首页最后一项时回退一页', () => {
        expect(getPageAfterDelete(3, 1)).toBe(2);
    });

    it('首页删除最后一项时仍停留在首页', () => {
        expect(getPageAfterDelete(1, 1)).toBe(1);
    });

    it('当前页仍有其他项时保持页码', () => {
        expect(getPageAfterDelete(2, 4)).toBe(2);
    });
});
