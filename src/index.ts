import help from './help.txt';
import { ArgParser } from './parseArgs';
import { write } from 'bun';

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : err;
  console.error(message);
  logHelp();
}

function main() {
  // const args = inputs.split(' ');
  const args = process.argv.slice(2);

  if (args.some(arg => arg === '--help')) return logHelp();

  const parser = new ArgParser(args);

  let saved = 0;
  let year = 1;
  let gross = parser.salary;
  let rows = ['year,gross,taxable,taxes,net,save,saved'];
  while (saved < parser.down) {
    gross = year > 1 ? gross * (1 + parser.raiseRate) : gross;
    const taxable = parser.deduct(gross);
    const taxes = parser.tax(taxable);
    const net = gross - taxes;
    const save = net * parser.saveRate;
    saved += save;
    rows.push(
      `${year},${gross.toFixed(2)},${taxable.toFixed(2)},${taxes.toFixed(
        2
      )},${net.toFixed(2)},${save.toFixed(2)},${saved.toFixed(2)}`
    );
    year++;
  }

  console.log(`Took ${year - 1} years to save at least ${parser.down}`);
  console.log('See results.csv for details');
  write('./results.csv', rows.join('\n'));
}

function logHelp() {
  console.log(help);
}
