import { Rational, one } from './rational.js';

export const DEFAULT_RATE = 'm';
export const DEFAULT_RATE_PRECISION = 3;
export const DEFAULT_COUNT_PRECISION = 1;

const seconds = one;
const minutes = Rational.fromFloat(60);
const hours = Rational.fromFloat(3600);

const displayRates = new Map([
    ['s', seconds],
    ['m', minutes],
    ['h', hours],
]);

export const longRateNames = new Map([
    ['s', 'second'],
    ['m', 'minute'],
    ['h', 'hour'],
]);

export class Formatter {
    constructor() {
        this.setDisplayRate(DEFAULT_RATE);
        this.displayFormat = 'decimal';
        this.ratePrecision = DEFAULT_RATE_PRECISION;
        this.countPrecision = DEFAULT_COUNT_PRECISION;
    }

    setDisplayRate(rate) {
        this.rateName = rate;
        this.longRate = longRateNames.get(rate);
        this.rateFactor = displayRates.get(rate);
    }

    align(s, prec) {
        if (this.displayFormat === 'rational') {
            return s;
        }
        let idx = s.indexOf('.');
        if (idx === -1) {
            idx = s.length;
        }
        let toAdd = prec - s.length + idx;
        if (prec > 0) {
            toAdd += 1;
        }
        while (toAdd > 0) {
            s += '\u00A0';
            toAdd--;
        }
        return s;
    }

    rate(rate) {
        rate = rate.mul(this.rateFactor);
        if (this.displayFormat === 'rational') {
            return rate.toMixed();
        }
        return rate.toDecimal(this.ratePrecision);
    }

    alignRate(rate) {
        return this.align(this.rate(rate), this.ratePrecision);
    }

    count(count) {
        if (this.displayFormat === 'rational') {
            return count.toMixed();
        }
        return count.toUpDecimal(this.countPrecision);
    }

    alignCount(count) {
        return this.align(this.count(count), this.countPrecision);
    }
}
