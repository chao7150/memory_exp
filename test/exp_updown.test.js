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

describe("calculate representative of the series", () => {
  test("right value", () => {

  })
})