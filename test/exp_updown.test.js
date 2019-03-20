const actions = require("../exp_updown")

describe("create progression", () => {
  test("right length", () => {
    for(var i = 0; i < 100; i++){
      for(var j = 1; j < 21; j++){
        expect(actions.createProgression(j)).toHaveLength(j)
        expect(actions.createProgression(j).slice(0, 1)).not.toBe("0")
      }
    }
  })
})

describe("create CSV", () => {
  test("right format", () => {
    expect(actions.createCSV([{
      trialNum: "trialNum",
      seriesNum: "series",
      seriesType: "seriesType",
      progression: "progression",
      response: "response",
      numberOfDigits: "numberOfDigits",
      correct: "correct"
    },{
      trialNum: "1",
      seriesNum: "1",
      seriesType: "1",
      progression: "1234",
      response: "1234",
      numberOfDigits: "4",
      correct: "1"
    },{
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
    expect(actions.switchSeriesType({}, {trialNum: 1})).toBe(1)
  })
  test("when number of digits is 1, next number of digits must be 2", () => {
    expect(actions.switchSeriesType({}, {numberOfDigits: 1})).toBe(1)
  })
  test("two successive correct or incorrect changes series", () => {
    const ordinaryTrial = {trialNum: 2, numberOfDigits: 2}
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType:  1, correct: 1})).toBe(1)
    //expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 1})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 1}, {...ordinaryTrial, seriesType:  1, correct: 1})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 1})).toBe(1)

    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType:  1, correct: 0})).toBe(1)
    //expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 0})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 1}, {...ordinaryTrial, seriesType:  1, correct: 0})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 1}, {...ordinaryTrial, seriesType: -1, correct: 0})).toBe(-1)

    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 1})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 0}, {...ordinaryTrial, seriesType: -1, correct: 1})).toBe(-1)
    //expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 1})).toBe(1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType: -1, correct: 1})).toBe(-1)

    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 0})).toBe(-1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:   1, correct: 0}, {...ordinaryTrial, seriesType: -1, correct: 0})).toBe(-1)
    //expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType:  1, correct: 0})).toBe(-1)
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType:  -1, correct: 0}, {...ordinaryTrial, seriesType: -1, correct: 0})).toBe(-1)
  })
})
