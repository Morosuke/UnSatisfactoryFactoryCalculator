import bigInt from 'big-integer';

export class Rational {
    constructor(p, q) {
        if (q.lesser(bigInt.zero)) {
            p = bigInt.zero.minus(p);
            q = bigInt.zero.minus(q);
        }
        const gcd = bigInt.gcd(p.abs(), q);
        if (gcd.greater(bigInt.one)) {
            p = p.divide(gcd);
            q = q.divide(gcd);
        }
        this.p = p;
        this.q = q;
    }

    toFloat() {
        return this.p.toJSNumber() / this.q.toJSNumber();
    }

    toString() {
        if (this.q.equals(bigInt.one)) {
            return this.p.toString();
        }
        return `${ this.p.toString() }/${ this.q.toString() }`;
    }

    toDecimal(maxDigits, roundingFactor) {
        if (maxDigits == null) {
            maxDigits = 3;
        }
        if (roundingFactor == null) {
            roundingFactor = new Rational(bigInt(5), bigInt(10).pow(maxDigits + 1));
        }

        let sign = '';
        let x = this;
        if (x.less(zero)) {
            sign = '-';
            x = zero.sub(x);
        }
        x = x.add(roundingFactor);
        let divmod = x.p.divmod(x.q);
        const integerPart = divmod.quotient.toString();
        let decimalPart = '';
        let fraction = new Rational(divmod.remainder, x.q);
        const ten = new Rational(bigInt(10), bigInt.one);
        while (maxDigits > 0 && !fraction.equal(roundingFactor)) {
            fraction = fraction.mul(ten);
            roundingFactor = roundingFactor.mul(ten);
            divmod = fraction.p.divmod(fraction.q);
            decimalPart += divmod.quotient.toString();
            fraction = new Rational(divmod.remainder, fraction.q);
            maxDigits -= 1;
        }
        if (fraction.equal(roundingFactor)) {
            while (decimalPart[decimalPart.length - 1] === '0') {
                decimalPart = decimalPart.slice(0, decimalPart.length - 1);
            }
        }
        if (decimalPart !== '') {
            return `${ sign + integerPart }.${ decimalPart }`;
        }
        return sign + integerPart;
    }

    toUpDecimal(maxDigits) {
        const fraction = new Rational(bigInt.one, bigInt(10).pow(maxDigits));
        const divmod = this.divmod(fraction);
        let x = this;
        if (!divmod.remainder.isZero()) {
            x = x.add(fraction);
        }
        return x.toDecimal(maxDigits, zero);
    }

    toMixed() {
        const divmod = this.p.divmod(this.q);
        if (divmod.quotient.isZero() || divmod.remainder.isZero()) {
            return this.toString();
        }
        return `${ divmod.quotient.toString() } + ${ divmod.remainder.toString() }/${ this.q.toString() }`;
    }

    isZero() {
        return this.p.isZero();
    }

    isInteger() {
        return this.q.equals(bigInt.one);
    }

    ceil() {
        const divmod = this.p.divmod(this.q);
        let result = new Rational(divmod.quotient, bigInt.one);
        if (!divmod.remainder.isZero()) {
            result = result.add(one);
        }
        return result;
    }

    floor() {
        const divmod = this.p.divmod(this.q);
        let result = new Rational(divmod.quotient, bigInt.one);
        if (result.less(zero) && !divmod.remainder.isZero()) {
            result = result.sub(one);
        }
        return result;
    }

    equal(other) {
        return this.p.equals(other.p) && this.q.equals(other.q);
    }

    less(other) {
        return this.p.times(other.q).lesser(this.q.times(other.p));
    }

    abs() {
        if (this.less(zero)) {
            return this.mul(minusOne);
        }
        return this;
    }

    add(other) {
        return new Rational(
            this.p.times(other.q).plus(this.q.times(other.p)),
            this.q.times(other.q)
        );
    }

    sub(other) {
        return new Rational(
            this.p.times(other.q).subtract(this.q.times(other.p)),
            this.q.times(other.q)
        );
    }

    mul(other) {
        return new Rational(
            this.p.times(other.p),
            this.q.times(other.q)
        );
    }

    div(other) {
        return new Rational(
            this.p.times(other.q),
            this.q.times(other.p)
        );
    }

    divmod(other) {
        const quotient = this.div(other);
        const div = quotient.floor();
        const mod = this.sub(other.mul(div));
        return { quotient: div, remainder: mod };
    }

    reciprocate() {
        return new Rational(this.q, this.p);
    }

    // exp must be a JS float with an integer in it.
    pow(exp) {
        return new Rational(this.p.pow(exp), this.q.pow(exp));
    }

    static fromDecimal(s) {
        const i = s.indexOf('.');
        if (i === -1 || i === s.length - 1) {
            return new Rational(bigInt(s), bigInt.one);
        }
        const integerPart = new Rational(bigInt(s.slice(0, i)), bigInt.one);
        const numerator = bigInt(s.slice(i + 1));
        const denominator = bigInt(10).pow(s.length - i - 1);
        return integerPart.add(new Rational(numerator, denominator));
    }

    static fromString(s) {
        const i = s.indexOf('/');
        if (i === -1) {
            return Rational.fromDecimal(s);
        }
        const j = s.indexOf('+');
        const q = bigInt(s.slice(i + 1));
        let p;
        if (j !== -1) {
            const integer = bigInt(s.slice(0, j));
            p = bigInt(s.slice(j + 1, i)).plus(integer.times(q));
        } else {
            p = bigInt(s.slice(0, i));
        }
        return new Rational(p, q);
    }

    static fromInteger(x) {
        return Rational.fromFloats(x, 1);
    }

    static fromFloat(arg) {
        if (arg === 0 || !Number.isFinite(arg) || Number.isNaN(arg)) {
            return zero;
        }
        if (Number.isInteger(arg)) {
            return Rational.fromInteger(arg);
        }
        const x = Math.abs(arg);
        let exp = Math.max(-1023, Math.floor(Math.log2(x)) + 1);
        let floatPart = x * (2 ** -exp);
        for (let i = 0; i < 300 && floatPart !== Math.floor(floatPart); i++) {
            floatPart *= 2;
            exp -= 1;
        }
        let numerator = bigInt(floatPart);
        let denominator = bigInt.one;
        if (exp > 0) {
            numerator = numerator.shiftLeft(exp);
        } else {
            denominator = denominator.shiftLeft(-exp);
        }
        return new Rational(numerator, denominator);
    }

    // This function is a hack, which intentionally limits its precision
    // in order to paper over floating-point inaccuracies.
    static fromFloatApproximate(x) {
        if (Number.isInteger(x)) {
            return Rational.fromFloats(x, 1);
        }
        // Sufficient precision for our data?
        const r = new Rational(bigInt(Math.round(x * 100000)), bigInt(100000));
        // Recognize 1/3 and 2/3 explicitly.
        const divmod = r.divmod(one);
        if (divmod.remainder.equal(threeTenths)) {
            return divmod.quotient.add(oneThird);
        } if (divmod.remainder.equal(threeFifths)) {
            return divmod.quotient.add(twoThirds);
        }
        return r;
    }

    static fromFloats(p, q) {
        return new Rational(bigInt(p), bigInt(q));
    }
}

// Decimal approximations.
const threeTenths = new Rational(bigInt(33333), bigInt(100000));
const threeFifths = new Rational(bigInt(33333), bigInt(50000));

const minusOne = new Rational(bigInt.minusOne, bigInt.one);
const zero = new Rational(bigInt.zero, bigInt.one);
const one = new Rational(bigInt.one, bigInt.one);
const half = new Rational(bigInt.one, bigInt(2));
const oneThird = new Rational(bigInt.one, bigInt(3));
const twoThirds = new Rational(bigInt(2), bigInt(3));

export {
    minusOne, zero, one, half, oneThird, twoThirds
};
