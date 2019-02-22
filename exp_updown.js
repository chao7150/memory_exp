const { h, app } = hyperapp

// 実験のパラメータを决める
const settings = {
  initialDifficulty: 4,
  series: 5,
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
    setTimeout(actions.endMemorize, 3000)
    return { ...state, presentation: actions.createProgression(state.numberOfDigits), inputBox: "" }
  },
  createProgression: length => Array.apply(null, {length}).map(() => Math.floor(Math.random() * 10)).join(""),
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
    const latestTrialLog = [
      state.trialNum,
      state.seriesNum,
      state.presentation,
      state.inputBox,
      state.numberOfDigits,
      correct ? 1 : 0
    ]
    const nextSeriesType = actions.switchSeriesType([correct, state.numberOfDigits])
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
    if (state.seriesNum > settings.series) {
      const memCap = actions.calcMemCap(state.log)
      return { ...state, result: actions.createCSV(state.log.concat([["capacity", memCap]])) }
    } else {
      setTimeout(actions.startMemorize, 3000)
      return state
    }
  },
  createCSV: array2d => array2d.map(row => row.join(",")).join("\r\n"),
  switchSeriesType: args => state => {
    const correct = args[0]
    const latestNoD = args[1]
    if (state.trialNum == 1) {
      return state.seriesType
    }
    // 文字数が0にならないようにする
    if (latestNoD == 1) {
        return 1
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
    for (let i = 1; i <= settings.series; i++) {
      const thisSeries = logs.filter(log => log[1] == i)
      sum += actions.calcReprOfSeries(thisSeries)
    }
    return sum / settings.series
  },
  // その系列の代表値を計算する
  calcReprOfSeries: thisSeries => {
    const correctTrials = thisSeries.filter(trial => trial[5] == 1)
    // 系列内に正解が1つもない場合
    if (correctTrials.length == 0) {
      // 2連続不正解の上昇系列では系列内第1試行より1つ少ない桁数を返すこととする
      if (thisSeries[0][1] == 1){
        return thisSeries[0][4] - 1
      } else { // 桁数が1になるまで不正解を続けた下降系列は0を返すこととする
        return 0
      }
    } else {  // 上記の特殊例以外は系列内で正解したもっとも大きい桁数を返す
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
    h("p", {}, state.result ? "このページを離れる前に必ず以下のデータを保存してください。メモ帳等のテキストエディタに貼り付けて拡張子を.csvとして保存するとexcelで開けます。" : ""),
    h("pre", {}, state.result)
  ])
)
module.exports = actions
//const main = app(state, actions, view, document.body)
//main.startMemorize()
