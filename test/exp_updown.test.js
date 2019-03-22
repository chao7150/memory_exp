const helpers = require("../exp_updown")

describe("create progression", () => {
  test("right length", () => {
    for (var i = 0; i < 100; i++) {
      for (var j = 1; j < 21; j++) {
        expect(helpers.createProgression(j)).toHaveLength(j)
        expect(helpers.createProgression(j).slice(0, 1)).not.toBe("0")
      }
    }
  })
})

describe("create CSV", () => {
  test("right format", () => {
    expect(helpers.createCSV([{
      trialNum: "trialNum",
      seriesNum: "series",
      seriesType: "seriesType",
      progression: "progression",
      response: "response",
      numberOfDigits: "numberOfDigits",
      correct: "correct"
    }, {
      trialNum: "1",
      seriesNum: "1",
      seriesType: "1",
      progression: "1234",
      response: "1234",
      numberOfDigits: "4",
      correct: "1"
    }, {
      trialNum: "2",
      seriesNum: "1",
      seriesType: "1",
      progression: "12345",
      response: "12344",
      numberOfDigits: "5",
      correct: "0"
    }])).toBe("trialNum,series,seriesType,progression,response,numberOfDigits,correct\r\n1,1,1,1234,1234,4,1\r\n2,1,1,12345,12344,5,0")
  })
})

describe("switch series type", () => {
  test("after first trial, series must be 1", () => {
    expect(helpers.switchSeriesType({}, { trialNum: 1 })).toBe(1)
  })
  test("when number of digits is 1, next number of digits must be 2", () => {
    expect(helpers.switchSeriesType({}, { numberOfDigits: 1 })).toBe(1)
  })
  test("two successive correct or incorrect changes series", () => {
    const ordinaryTrial = { trialNum: 2, numberOfDigits: 2 }
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 1 }, { ...ordinaryTrial, seriesType: 1, correct: 1 })).toBe(1)
    //expect(helpers.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 1})).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 1 }, { ...ordinaryTrial, seriesType: 1, correct: 1 })).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 1 }, { ...ordinaryTrial, seriesType: -1, correct: 1 })).toBe(1)

    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 1 }, { ...ordinaryTrial, seriesType: 1, correct: 0 })).toBe(1)
    //expect(helpers.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 0})).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 1 }, { ...ordinaryTrial, seriesType: 1, correct: 0 })).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 1 }, { ...ordinaryTrial, seriesType: -1, correct: 0 })).toBe(-1)

    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 0 }, { ...ordinaryTrial, seriesType: 1, correct: 1 })).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 0 }, { ...ordinaryTrial, seriesType: -1, correct: 1 })).toBe(-1)
    //expect(helpers.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 1})).toBe(1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 0 }, { ...ordinaryTrial, seriesType: -1, correct: 1 })).toBe(-1)

    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 0 }, { ...ordinaryTrial, seriesType: 1, correct: 0 })).toBe(-1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: 1, correct: 0 }, { ...ordinaryTrial, seriesType: -1, correct: 0 })).toBe(-1)
    //expect(helpers.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 0})).toBe(-1)
    expect(helpers.switchSeriesType({ ...ordinaryTrial, seriesType: -1, correct: 0 }, { ...ordinaryTrial, seriesType: -1, correct: 0 })).toBe(-1)
  })
})

describe("Indexes of", () => {
  expect(helpers.IndexesOf([0, 1, 2], 2)).toEqual([2])
  expect(helpers.IndexesOf([2, 1, 0, 1, 2], 2)).toEqual([0, 4])
  expect(helpers.IndexesOf([2], 2)).toEqual([0])
  expect(helpers.IndexesOf([], 2)).toEqual([])
})

describe("separate into series", () => {
  expect(helpers.separateIntoSeries([
    { seriesNum: 1 },
    { seriesNum: 2 },
    { seriesNum: 2 },
    { seriesNum: 3 },
    { seriesNum: 3 },
    { seriesNum: 3 },
    { seriesNum: 4 },
    { seriesNum: 4 },
    { seriesNum: 4 },
    { seriesNum: 4 },
    { seriesNum: 5 },
    { seriesNum: 5 },
    { seriesNum: 5 },
    { seriesNum: 5 },
    { seriesNum: 5 },
  ])).toEqual([
    [{ seriesNum: 1 }],
    [{ seriesNum: 2 }, { seriesNum: 2 }],
    [{ seriesNum: 3 }, { seriesNum: 3 }, { seriesNum: 3 },],
    [{ seriesNum: 4 }, { seriesNum: 4 }, { seriesNum: 4 }, { seriesNum: 4 },],
    [{ seriesNum: 5 }, { seriesNum: 5 }, { seriesNum: 5 }, { seriesNum: 5 }, { seriesNum: 5 },],
  ])
})

describe("calculate representative value of the series", () => {
  test("no correct trial in the series", () => {
    expect(helpers.calcReprOfSeries([
      { correct: 0, seriesType: 1, numberOfDigits: 4 },
      { correct: 0, seriesType: 1, numberOfDigits: 5 },
    ])).toBe(3)
    expect(helpers.calcReprOfSeries([
      { correct: 0, seriesType: 0, numberOfDigits: 3 },
      { correct: 0, seriesType: 0, numberOfDigits: 2 },
      { correct: 0, seriesType: 0, numberOfDigits: 1 }
    ])).toBe(0)
  })
  test("no successive correct trials in the series", () => {
    expect(helpers.calcReprOfSeries([
      { correct: 0, seriesType: 1, numberOfDigits: 4 },
      { correct: 1, seriesType: 1, numberOfDigits: 5 },
      { correct: 0, seriesType: 1, numberOfDigits: 6 },
      { correct: 1, seriesType: 1, numberOfDigits: 7 },
      { correct: 0, seriesType: 1, numberOfDigits: 8 },
      { correct: 0, seriesType: 1, numberOfDigits: 9 }
    ])).toBe(3)
  })
  test("general", () => {
    expect(helpers.calcReprOfSeries([
      { correct: 1, seriesType: 1, numberOfDigits: 4 },
      { correct: 1, seriesType: 1, numberOfDigits: 5 },
      { correct: 0, seriesType: 1, numberOfDigits: 6 },
      { correct: 1, seriesType: 1, numberOfDigits: 7 },
      { correct: 0, seriesType: 1, numberOfDigits: 8 },
      { correct: 0, seriesType: 1, numberOfDigits: 9 }
    ])).toBe(5)
    expect(helpers.calcReprOfSeries([
      { correct: 0, seriesType: -1, numberOfDigits: 9 },
      { correct: 1, seriesType: -1, numberOfDigits: 8 },
      { correct: 0, seriesType: -1, numberOfDigits: 7 },
      { correct: 0, seriesType: -1, numberOfDigits: 6 },
      { correct: 1, seriesType: -1, numberOfDigits: 5 },
      { correct: 1, seriesType: -1, numberOfDigits: 4 }
    ])).toBe(5)
  })
})