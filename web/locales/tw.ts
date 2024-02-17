export default {
  pages: {
    indexPage: {
      description: "綜合閱讀應用，集成了AI。目前正在進行Beta測試。",
      getStartedButton: "開始",
    },
    loginPage: {
      loginDescription: "登入到您的帳戶",
      backButton: "返回",
    },
    student: {
      readPage: {
        articleSelection: "文章選擇",
        article: {
          articleNotFound: "找不到文章",
          articleInsufficientLevel: "您的閱讀水平不足，無法閱讀此文章。",
          readBefore: "您之前讀過這篇文章",
          readBeforeDescription:
            "您可以再次閱讀並練習，以提高您的閱讀技能。這是您之前閱讀的結果。",
          status: "狀態",
          statusText: {
            completed: "已完成",
            uncompleted: "未完成",
          },
          statusDescription: "最後更新於 {date}",
          score: "測驗分數",
          scoreText: "{score}",
          scoreDescription: "共 {total} 個問題",
          rated: "已評分",
          ratedText: "{rated} 分",
          ratedDescription: "您對這篇文章的評分",
          timeSpend: "花費時間",
          timeSpendText: "{time}",
          timeSpendDescription: "在 {total} 個問題中",
          scoreSuffix: {
            point: "分",
            points: "分",
          },
          secondSuffix: {
            second: "秒",
            seconds: "秒",
          },
        },
      },
      historyPage: {
        reminderToReread: "重讀提醒",
        articleRecords: "文章記錄",
        reminderToRereadDescription:
          "您可能想再次嘗試閱讀這些文章，以查看您是否有所提高。",
        articleRecordsDescription: "您的閱讀記錄將在這裡顯示。",
      },
      practicePage: {
        flashcard: "單詞卡",
        flashcardDescription:
          "您可以使用單詞卡來練習您的閱讀技能，您保存的句子將在這裡顯示。",
        savedSentences: "保存的句子",
        noSavedSentences: "您沒有保存的句子。",
        savedSentencesDescription: "您有 {total} 個保存的句子。",
        added: "添加於 {date}",
        deleteButton: "刪除",
        toast: {
          success: "成功",
          successDescription: "成功刪除保存的句子",
          error: "錯誤",
          errorDescription: "刪除保存的句子時出錯",
        },
        flashcardPractice: {
          buttonAgain: "再來",
          buttonHard: "難",
          buttonGood: "好",
          buttonEasy: "很容易",
          flipCard: "翻轉",
        },
        //Order Sentences
        OrderSentences: "排列句子",
        OrderSentencesDescription:
          "这是你读过的一篇文章中的一些句子。请将这些句子排列成对你有意义的顺序。如果顺序与文章中的相同，你将获得15经验值。",
      },
    },
  },
  components: {
    mainNav: {
      home: "主頁",
      about: "關於",
      contact: "聯繫",
    },
    userAccountNav: {
      level: "等級 {level}",
      settings: "設置",
      signOut: "登出",
    },
    themeSwitcher: {
      dark: "暗模式",
      light: "亮模式",
      system: "系統",
    },
    localeSwitcher: {
      en: "English",
      th: "ไทย",
      cn: "简体字",
      tw: "繁體字",
      vi: "Tiếng Việt",
    },
    sidebarNav: {
      read: "閱讀",
      history: "歷史",
      practice: "練習",
      reports: "報告",
    },
    articleRecordsTable: {
      title: "標題",
      date: "日期",
      rated: "已評分",
      search: "搜索標題...",
      previous: "上一個",
      next: "下一個",
      select: "已選擇 {selected} 個，共 {total} 個",
    },
    firstRunLevelTest: {
      heading: "讓我們開始測試你的技能吧!",
      description: "選擇正確的答案來評估您的閱讀水平。",
      nextButton: "下一個",
      section: "部分 {currentSectionIndex}",
      toast: {
        successUpdate: "成功!",
        successUpdateDescription: "您的經驗和等級已更新。",
        attention: "注意",
        attentionDescription: "請回答所有問題!",
        errorTitle: "出了點問題。",
        errorDescription: "您的經驗和等級未更新。請重試。",
      },
      congratulations: "恭喜!",
      congratulationsDescription: "「評估完成。」",
      yourScore: "你的分數 : {xp}",
      yourCefrLevel: "你的 CEFR 等級 : {cefrLevel}", 
      yourRaLevel: "你的 RA 等級 : {raLevel}",
      getStartedButton: "開始",
    },
    progressBarXp: {
      xp: "經驗: ",
      level: "等級 {level}",
    },
    select: {
      articleChoose: "請選擇您想閱讀的 {article}",
      articleChooseDescription:
        "您的級別是 {level}，這裡是您可以選擇的 {article}。",
    },
    article: {
      type: "文章類型",
      genre: "文章種類",
      subGenre: "文章子類",
      article: "文章",
    },
    articleCard: {
      raLevel: "閱讀能力等級為 {raLevel}",
      cefrLevel: "CEFR 等級為 {cefrLevel}",
      articleCardDescription: "該文章涉及 {topic} 主題，屬於 {genre} 類別。",
    },
    articleContent: {
      voiceAssistant: "語音助手",
      soundButton: {
        play: "播放聲音",
        pause: "暫停聲音",
      },
      // button translate
      translateฺButton: {
        open: "翻譯",
        close: "關閉翻譯視窗",
      },
    },
    mcq: {
      quiz: "測驗",
      reQuiz: "重新測驗",
      quizDescription:
        "開始測驗以測試您的知識，並看看這篇文章對您來說有多容易。",
      reQuizDescription:
        "您以前完成過這個測驗。您可以重新參加測驗以提高您的分數。",
      startButton: "開始測驗",
      retakeButton: "重新測驗",
      elapsedTime: "已用時間 {time} 秒",
      questionHeading: "問題 {number}，共 {total} 個",
      nextQuestionButton: "下一個問題",
      toast: {
        correct: "正確",
        correctDescription: "您答對了！",
        incorrect: "錯誤",
        incorrectDescription: "您答錯了！",
        quizCompleted: "測驗完成",
        quizCompletedDescription: "您已完成測驗",
        error: "錯誤",
        errorDescription: "提交答案時出錯，請稍後再試。",
      },
    },
    rate: {
      title: "評價這篇文章",
      description: "此評分用於計算您的下一個級別。",
      newLevel: "您的新級別是 {level}",
      submitButton: "提交",
      backToHomeButton: "返回主頁",
      nextQuizButton: "下一個測驗",
      toast: {
        success: "成功",
        successDescription: "您的新級別是 {level}。",
      },
    },
    audioButton: {
      play: "播放聲音",
      pause: "暫停聲音",
    },
    menu: "菜單",
    loginButton: "登錄",
  },
} as const;
