const actions = require("../exp_updown")

describe("create progression", () => {
  test("right length", () => {
    for(var i = 0; i < 100; i++){
      for(var j = 1; j < 21; j++){
        expect(actions.createProgression(j).length).toBe(j)
      }
    }
  })
})

describe("create CSV", () => {
  test("right format", () => {
    expect(actions.createCSV([["a", "b"],["c", "d"]])).toBe("a,b\r\nc,d")
    expect(actions.createCSV([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]])).toBe("a,b,c\r\nd,e,f\r\ng,h,i")
  })
})

describe("switch series type", () => {
  test("after first trial, series must be 1", () => {
    expect(actions.switchSeriesType({trialNum: 1}, {})).toBe(1)
  })
  test("when number of digits is 1, next number of digits must be 2", () => {
    expect(actions.switchSeriesType({numberOfDigits: 1}, {})).toBe(1)
  })
  test("two successive correct or incorrect changes series", () => {
    const ordinaryTrial = {trialNum: 2, numberOfDigits: 2}
    expect(actions.switchSeriesType({...ordinaryTrial, seriesType: 1, correct: 1}, {...ordinaryTrial})).toBe()
  })
})
