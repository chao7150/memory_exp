// practice
// L74 is the only difference from honban

const { h, app } = hyperapp

const settings = {
  initialDifficulty: 4,
  trials: 10
}

const state = {
  presentation: "",
  visibility: "visible",
  inputBox: "",
  result: "",
  readonly: "readonly",
  trialNum: 1,
  seriesType: 1, // 上昇系列:1, 下降系列:-1
  numberOfDigits: settings.initialDifficulty,
  log: [["trialNum", "series", "number", "response", "numberOfDigits", "correct"]],
  seriesNum: 1
}

const actions = {
  startMemorize: () => (state, actions) => {
    let newNumber = ""
    for (let i = 0; i < state.numberOfDigits; i++) {
      const digit = String(Math.floor(Math.random() * 10))
      newNumber += digit
    }
    setTimeout(actions.endMemorize, 3000)
    return { ...state, presentation: newNumber, inputBox: "" }
  },
  endMemorize: () => (state, actions) => {
    setTimeout(actions.startAnswer, 5000)
    return { ...state, visibility: "hidden" }
  },
  startAnswer: () => state => {
    document.getElementById("js-input-form").focus()
    return { ...state, readonly: "writable" }
  },
  submit: e => (state, actions) => {
    // エンターキー以外は無視
    if (e.keyCode !== 13) {
      return state
    }
    // 保持時間中の入力は受け付けない
    if (state.readonly == "readonly") {
      return state
    }
    // 正解判定
    const correct = state.presentation == state.inputBox
    latestTrialLog = [
      state.trialNum,
      state.seriesNum,
      state.presentation,
      state.inputBox,
      state.numberOfDigits,
      correct ? 1 : 0
    ]
    console.log(latestTrialLog)
    const nextSeriesType = actions.switchSeriesType(correct)
    state = {
      ...state,
      trialNum: state.trialNum + 1,
      log: state.log.concat([latestTrialLog]),
      presentation: correct ? "correct" : "incorrect",
      visibility: "visible",
      numberOfDigits: state.numberOfDigits + nextSeriesType,
      seriesType: nextSeriesType,
      readonly: "readonly",
      seriesNum: state.seriesNum + (nextSeriesType != state.seriesType ? 1 : 0),
    }
    // 終了条件
    if (state.trialNum > settings.trials) {
      const memCap = actions.calcMemCap(state.log)
      return { ...state, result: actions.createCSV(state.log.concat([["capacity", memCap]])) }
    } else {
      setTimeout(actions.startMemorize, 3000)
      return state
    }
  },
  createCSV: array2d => array2d.map(row => row.join(",")).join("\r\n"),
  switchSeriesType: correct => state => {
    if (state.trialNum == 1) {
      return state.seriesType
    }
    if (state.seriesType == 1 && state.log[state.log.length - 1][5] == 0 && !correct) {
      return -1
    } else if (state.seriesType == -1 && state.log[state.log.length - 1][5] == 1 && correct) {
      return 1
    } else {
      return state.seriesType
    }
  },
  calcMemCap: logs => {
    var sum = 0
    for (let i = 1; i <= settings.trials; i++) {
      const thisSeries = logs.filter(log => log[1] == i)
      sum += actions.calcReprOfSeries(thisSeries)
    }
    return sum / settings.trials
  },
  calcReprOfSeries: thisSeries => {
    const correctTrials = thisSeries.filter(trial => trial[5] == 1)
    if (correctTrials.length == 0) {
      return thisSeries[0][4] - 1
    } else {
      return Math.max(...correctTrials.map(trial => trial[4]))
    }
  },
  updateInput: e => state => {
    return { ...state, inputBox: e.target.value }
  }
}

const view = (state, actions) => (
  h("div", {}, [
    h("main", { class: "center" }, [
      h("h1", {}, "memory experiment"),
      h("h2", {
        class: "disable-copy",
        style: { visibility: state.visibility }
      }, state.presentation),
      h("input", {
        id: "js-input-form",
        value: state.inputBox,
        oninput: actions.updateInput,
        onkeydown: actions.submit,
        [state.readonly]: "readonly"
      })
    ]),
    h("br"),
    h("pre", {}, state.result)
  ])
)

const main = app(state, actions, view, document.body)
main.startMemorize()
