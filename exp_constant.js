const { h, app } = hyperapp

const state = {
  setDifficultyPhase: true,
  presentation: "",
  visibility: "visible",
  inputBox: "",
  result: "",
  readonly: "readonly",
  trialNum: 1,
  difficultyList: [],
  log: [{
    trialNum: "trialNum",
    progression: "progression",
    response: "response",
    numberOfDigits: "numberOfDigits",
    correct: "correct",
  }]
}

const actions = {
  startMemorize: () => (state, actions) => {
    setTimeout(actions.endMemorize, 3000)
    return { ...state, presentation: helpers.createProgression(state.difficultyList[state.trialNum - 1]), inputBox: "" }
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
    latestTrialLog = {
      trialNum: state.trialNum,
      progression: state.presentation,
      response: state.inputBox,
      numberOfDigits: state.difficultyList[state.trialNum - 1],
      correct: correct ? 1 : 0,
    }
    state = {
      ...state,
      trialNum: state.trialNum + 1,
      log: state.log.concat([latestTrialLog]),
      presentation: correct ? "correct" : "incorrect",
      visibility: "visible",
      readonly: "readonly"
    }
    if (state.trialNum > state.difficultyList.length) {
      const resultCSV = helpers.createCSV(state.log)
      const resultBlob = new Blob([resultCSV])
      const virtualAnchor = document.createElement("a")
      virtualAnchor.setAttribute("download", "constant.csv")
      virtualAnchor.href = URL.createObjectURL(resultBlob)
      virtualAnchor.click()
      return { ...state, presentation: "end", result: resultCSV }
    }
    setTimeout(actions.startMemorize, 3000)
    return state
    }
  },
  createCSV: array2d => array2d.map(row => row.join(",")).join("\r\n"),
  updateInput: e => state => {
    return { ...state, inputBox: e.target.value }
  },
  submitConfiguration: () => (state, actions) => {
    const conf = {
      min: parseInt(document.getElementById("min").value),
      max: parseInt(document.getElementById("max").value),
      trialsPerDifficulty: parseInt(document.getElementById("trialsPerDifficulty").value)
    }
    let difficultyList = []
    for (let i = conf.min; i <= conf.max; i++) {
      difficultyList.push(...new Array(conf.trialsPerDifficulty).fill(i))
    }
    // シャッフル https://qiita.com/artistan/items/9eb9a0fb14f4ec3a8764
    for (var i = difficultyList.length - 1; i >= 0; i--) {
      // 0~iのランダムな数値を取得
      var rand = Math.floor(Math.random() * (i + 1));
      // 配列の数値を入れ替える
      [difficultyList[i], difficultyList[rand]] = [difficultyList[rand], difficultyList[i]]
    }
    setTimeout(actions.startMemorize, 100)
    return { ...state, setDifficultyPhase: false, configuration: conf, difficultyList: difficultyList }
  }
}

// データ処理を担当する関数群
const helpers = {
  createProgression: length => {
    const max = 10 ** length
    const min = 10 ** (length - 1)
    return String(Math.floor(Math.random() * (max - min) + min))
  },
  createCSV: arrayOfLogs => {
    return arrayOfLogs.map(log => {
      return [
        log.trialNum,
        log.progression,
        log.response,
        log.numberOfDigits,
        log.correct
      ]
    }).map(row => row.join(",")).join("\r\n")
  },
  switchSeriesType: (latestSecondTrialLog, latestTrialLog) => {
    if (latestTrialLog.trialNum == 1) {
      return 1
    }
    // 文字数が0にならないようにする
    if (latestTrialLog.numberOfDigits == 1) {
      return 1
    }
    if (latestTrialLog.seriesType == 1 && latestSecondTrialLog.correct == 0 && latestTrialLog.correct == 0) {
      return -1
    } else if (latestTrialLog.seriesType == -1 && latestSecondTrialLog.correct == 1 && latestTrialLog.correct == 1) {
      return 1
    } else {
      return latestTrialLog.seriesType
    }
  },
  separateIntoSeries: logs => {
    const separatedLogs = []
    for (let i = 1; i <= logs[logs.length - 1].seriesNum; i++) {
      separatedLogs.push(logs.filter(log => log.seriesNum == i))
    }
    return separatedLogs
  },
  // その系列の代表値を計算する
  calcReprOfSeries: thisSeries => {
    const seriesType = thisSeries[0].seriesType
    const correctTrials = thisSeries.filter(trial => trial.correct == 1)
    // 系列内に正解が1つもない場合
    if (correctTrials.length == 0) {
      // 2連続不正解の上昇系列では系列内第1試行より1つ少ない桁数を返すこととする
      if (seriesType == 1) {
        return thisSeries[0].numberOfDigits - 1
      } else { // 桁数が1になるまで不正解を続けた下降系列は0を返すこととする
        return 0
      }
    }
    const correctArray = thisSeries.map(trial => trial.correct)
    const successiveCorrectArray = []
    for (let i = 1; i < correctArray.length; i++) {
      successiveCorrectArray.push(correctArray[i - 1] + correctArray[i])
    }
    const successiveCorrectIndexes = helpers.IndexesOf(successiveCorrectArray, 2)
    // 2連続正答がない（上昇系列で起こりうる）ときは系列内第1試行より1つ少ない桁数を返すこととする
    if (successiveCorrectIndexes.length == 0) {
      return thisSeries[0].numberOfDigits - 1
    }
    if (seriesType == 1) {
      return thisSeries[Math.max(...successiveCorrectIndexes) + 1].numberOfDigits
    }
    return thisSeries[successiveCorrectIndexes[0]].numberOfDigits
  },
  IndexesOf: (array, value) => {
    const indexes = []
    let idx = array.indexOf(value)
    while (idx != -1) {
      indexes.push(idx)
      idx = array.indexOf(value, idx + 1)
    }
    return indexes
  },
}

const view = (state, actions) => (
  state.setDifficultyPhase ?
    h("div", {}, [
      h("main", { class: "center" }, [
        h("h1", {}, "input range"),
        h("p", {}, [
          h("input", { id: "min", type: "number" }),
          "~",
          h("input", { id: "max", type: "number", min: "0" }),
          "桁"
        ]),
        h("p", {}, ["各桁ごとに", h("input", { id: "trialsPerDifficulty", type: "number" }), "試行ずつ"]),
        h("p", {}, [
          h("button", { onclick: actions.submitConfiguration }, "実験開始")
        ])
      ])
    ]) :
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
          [state.readonly]: ""
        })
      ]),
      h("br"),
      h("p", {}, state.result ? "このページを離れる前に必ず以下のデータを保存してください。メモ帳等のテキストエディタに貼り付けて拡張子を.csvとして保存するとexcelで開けます。" : ""),
      h("pre", {}, state.result)
    ])
)

const main = app(state, actions, view, document.body)
