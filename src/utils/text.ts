/*
  Text utils
*/

const quoteItems = (arr: string[]): string[] => {
  return arr.map(item => "'" + item + "'");
};

const createList = (arr: string[]): string => {
  return arr.reduce((acc, item, i, arr) =>
    i === 0            ? item :
    i < arr.length - 1 ? acc + ', ' + item
                       : acc + ' & ' + item
  , '');
};

const sIfMultiple = (arr: any[]): string => arr.length > 1 ? 's' : '';

/*
  Exports
*/

export {
  quoteItems,
  createList,
  sIfMultiple
};
