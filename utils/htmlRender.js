const dayjs = require('dayjs');

function CurrencyDisplay (value) {
  let stringValue = `${value}`;
  let formattedIntegerPart = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formattedIntegerPart}`;
};

const formatDate = (date, format) => {
  return dayjs(date).format(format);
};

module.exports = {
  CurrencyDisplay,
  formatDate
}