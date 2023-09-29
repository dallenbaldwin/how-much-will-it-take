export class ArgParser {
  salary: number;
  raiseRate = 0.3;
  down: number;
  saveRate = 0.05;
  private investRate = 0;
  private investFlat = 0;
  private healthRate = 0;
  private healthFlat = 0;
  private status: 'single' | 'married' | 'head' = 'single';

  constructor(args: string[]) {
    function getFloat(field: string) {
      const next = args.shift();
      if (!next || next.startsWith('-'))
        throw new Error(`cannot use an empty ${field} value`);
      const parsed = parseFloat(next);
      if (Number.isNaN(parsed)) throw new Error(`${next} is not a number`);
      if (parsed <= 0) throw new Error(`${field} must be greater than 0`);
      return parsed;
    }

    let salary, down;
    while (args.length) {
      const arg = args.shift();
      if (!arg) break;
      else if (['--salary', '-s'].includes(arg)) salary = getFloat('salary');
      else if (['--raise', '-r'].includes(arg)) this.raiseRate = getFloat('raise rate');
      else if (['--house', '-h']) down = getFloat('house') * 0.2;
      else if (['--invest-rate', '-i'].includes(arg))
        this.investRate = this.resolvePercent(getFloat('investment rate'));
      else if (arg === '--invest-flat') this.investFlat = getFloat('flat investment');
      else if (arg === '--total-healthcare')
        this.healthFlat = getFloat('total healthcare');
      else if (arg === '--per-check-healthcare')
        this.healthRate = getFloat('per check healthcare');
      else if (arg === '--single') this.status = 'single';
      else if (arg === '--married-joint') this.status = 'married';
      else if (arg === '--head-of-house') this.status = 'head';
      else if (arg === '--savings-rate')
        this.saveRate = this.resolvePercent(getFloat('savings rate'));
      else throw new Error(`unrecognized argument: ${arg}`);
    }

    if (!salary) throw new Error('cannot use an empty salary value');
    this.salary = salary;
    if (!down) throw new Error('cannot use an empty desired house value');
    this.down = down;
  }

  private resolvePercent(value: number) {
    return value >= 1 ? value / 100 : value;
  }

  deduct(salary: number) {
    const invest = this.investFlat + this.investRate * salary;
    const health = this.healthFlat + this.healthRate * 24;
    return salary - invest - health;
  }

  tax(taxable: number) {
    const brackets = {
      single: {
        10: 11_000,
        12: 44_725,
        22: 95_375,
        24: 182_100,
        32: 231_250,
        35: 578_125,
        37: Infinity,
      },
      married: {
        10: 22_000,
        12: 89_450,
        22: 190_750,
        24: 364_200,
        32: 462_500,
        35: 693_750,
        37: Infinity,
      },
      head: {
        10: 15_700,
        12: 59_850,
        22: 95_350,
        24: 182_100,
        32: 231_250,
        35: 578_100,
        37: Infinity,
      },
    } as const;
    const bracket = brackets[this.status];
    let total = 0;
    for (const k in bracket) {
      if (taxable <= 0) break;
      const rate = k as unknown as keyof typeof bracket;
      const percent = +rate / 100;
      const threshold = bracket[rate];
      let toTax;
      if (threshold === Infinity) {
        toTax = taxable;
        taxable -= taxable;
      } else {
        taxable -= threshold;
        toTax = taxable < 0 ? threshold + taxable : threshold;
      }
      total += toTax * percent;
    }
    return total;
  }
}
