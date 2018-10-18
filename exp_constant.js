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
  log: [["trialNum", "number", "response", "numberOfDigits", "correct"]]
}

const actions = {
  startMemorize: () => (state, actions) => {
    let newNumber = ""
    for (let i = 0; i < state.difficultyList[state.trialNum - 1]; i++) {
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
      state.presentation,
      state.inputBox,
      state.difficultyList[state.trialNum - 1],
      correct ? 1 : 0
    ]
    state = {
      ...state,
      trialNum: state.trialNum + 1,
      log: state.log.concat([latestTrialLog]),
      presentation: correct ? "correct" : "incorrect",
      visibility: "visible",
      readonly: "readonly"
    }
    if (state.trialNum > state.difficultyList.length) {
      return { ...state, presentation: "end", result: actions.createCSV(state.log) }
    } else {
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
