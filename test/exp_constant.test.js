const constant_helpers = require("../exp_constant")

describe("create progression", () => {
  test("right length", () => {
    for (var i = 0; i < 100; i++) {
      for (var j = 1; j < 21; j++) {
        expect(constant_helpers.createProgression(j)).toHaveLength(j)
        expect(constant_helpers.createProgression(j).slice(0, 1)).not.toBe("0")
      }
    }
  })
})

describe("create CSV", () => {
  test("right format", () => {
    expect(constant_helpers.createCSV([{
      trialNum: "trialNum",
      progression: "progression",
      response: "response",
      numberOfDigits: "numberOfDigits",
      correct: "correct"
    }, {
      trialNum: "1",
      progression: "1234",
      response: "1234",
      numberOfDigits: "4",
      correct: "1"
    }, {
      trialNum: "2",
      progression: "12345",
      response: "12344",
      numberOfDigits: "5",
      correct: "0"
    }])).toBe("trialNum,progression,response,numberOfDigits,correct\r\n1,1234,1234,4,1\r\n2,12345,12344,5,0")
  })
})