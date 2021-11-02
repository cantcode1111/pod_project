import {
  isAfter,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  getDay,
  getDate,
  setDate,
  add
} from "date-fns";

const testForecastEndDate = "01/01/2022";

const testPayObjects = [
  {
    date: "01/01/2016",
    salary: 100000,
    bonusMultiplier: 0.1
  },
  {
    date: "01/01/2018",
    salary: 200000,
    bonusMultiplier: 0.2
  }
];

const testExpenseObjects = [
  {
    start: "01/01/2016",
    end: "01/01/2018",
    expenses: -1300,
    days: 14
  },
  {
    start: "01/01/2018",
    end: "01/01/2020",
    expenses: -1300,
    days: 14
  }
];

const testRentObjects = [
  {
    start: "01/01/2016",
    end: "01/01/2018",
    rent: -2750,
    rentDay: 1
  },
  {
    start: "01/01/2018",
    end: "01/01/2020",
    rent: -2600,
    rentDay: 1
  }
];

const testJobInfo = {
  employer: "facebook",
  start: "01/06/2016",
  end: null,
  workWeekDays: 5,
  payPeriodWeeks: 2,
  payDayFirst: "01/06/2016",
  bonusPeriodWeeks: 26,
  bonusDayFirst: "03/16/2016",
  vestPeriodMonths: 3,
  vestDayFirst: "03/16/2016",
  location: "US-CA"
};

let testDate = new Date("06/01/2016");

function weeklyBinary(start, end, weekday, filter) {
  return eachWeekOfInterval(
    {
      start: new Date(start),
      end: new Date(end)
    },
    { weekStartsOn: getDay(new Date(weekday)) }
  )
    .filter((_, i) => 0 === i % filter)
    .map(x => x.getTime());
}

function monthlyBinary(start, end, filter, day) {
  return eachMonthOfInterval({
    start: new Date(start),
    end: new Date(end)
  })
    .map(x => setDate(new Date(x), day))
    .filter((_, i) => 0 === i % filter)
    .map(x => x.getTime());
}

//Match Day to one from an object array
function dayMatch(set, day) {
  return set.includes(new Date(day).getTime());
}

//Create Weekly Pay Schedule
const payDays = weeklyBinary(
  testJobInfo.start,
  testForecastEndDate,
  testJobInfo.payDayFirst,
  testJobInfo.payPeriodWeeks
);

//Create Bonus Pay Schedule
const bonusDays = weeklyBinary(
  testJobInfo.bonusDayFirst,
  testForecastEndDate,
  testJobInfo.bonusDayFirst,
  testJobInfo.bonusPeriodWeeks
);

//Create Vest Schedule
const vestDays = monthlyBinary(
  testJobInfo.vestDayFirst,
  testForecastEndDate,
  testJobInfo.vestPeriodMonths,
  getDate(new Date(testJobInfo.vestDayFirst))
);

//Create Rent Schedule
const rentDays = monthlyBinary(
  testRentObjects[0].start,
  testRentObjects[0].end,
  1,
  testRentObjects[0].rentDay
);

function calulateDay(date) {
  let value = {};

  //TODO: Move these to functions, don't know how to deal with 'element' references
  //Generate Daily Pay Information
  for (let element of testPayObjects.reverse()) {
    if (isAfter(date, new Date(element["date"]))) {
      value = {
        salary: element.salary,
        pay: (element.salary / 52) * testJobInfo.payPeriodWeeks,
        bonusMultiplier:
          (element.bonusMultiplier / 52) * testJobInfo.bonusPeriodWeeks,
        bonus:
          ((element.salary * element.bonusMultiplier) / 52) *
          testJobInfo.bonusPeriodWeeks,
        isPayDay: dayMatch(payDays, date),
        isBonusDay: dayMatch(bonusDays, date),
        isVestDay: dayMatch(vestDays, date)
      };
      break;
    }
  }

  //Add Daily Expenses
  for (let element of testExpenseObjects.reverse()) {
    if (
      isWithinInterval(date, {
        start: new Date(element.start),
        end: new Date(element.end)
      })
    ) {
      value.expense = element.expenses / element.days;
      break;
    }
  }

  //Add Daily Expenses
  for (let element of testRentObjects.reverse()) {
    if (
      isWithinInterval(date, {
        start: new Date(element.start),
        end: new Date(element.end)
      })
    ) {
      value.rent = element.rent;
      value.isRentDay = dayMatch(rentDays, date);
      break;
    }
  }
  // console.log(value);
  return value;
}

let date = testDate;
let latestBalance = 100000;
let totalResults = [];

for (let i = 0; i < 14; i++) {
  let result = calulateDay(date);
  result.date = date;
  result.balance = latestBalance;
  // console.log(result.isPayDay && result.salary);

  let array = [
    latestBalance,
    result.isPayDay && result.pay,
    result.isBonusDay && result.bonus,
    result.isRentDay && result.rent,
    result.expense
  ];
  console.log(array);
  // Getting sum of numbers
  latestBalance = array.reduce(function(a, b) {
    return a + b;
  }, 0);
  date = add(new Date(date), {
    days: 1
  });
  totalResults.push(result);
}
console.log(totalResults);
