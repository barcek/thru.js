/*
  Functions
*/

const namePkgVar = name => name.replace(/-(\w)/g, (hyphen, char) => char.toUpperCase());

const sIfMultiple = arr => arr.length > 1 ? 's' : '';

const quoteItems = arr => arr.map(item => `'${item}'`);

const createList = arr => arr.reduce((acc, item, i, arr) =>
  i === 0            ? item :
  i < arr.length - 1 ? acc + ', ' + item
                     : acc + ' & ' + item
, '');

/*
  Exports
*/

export {
  namePkgVar,
  sIfMultiple,
  quoteItems,
  createList
};
