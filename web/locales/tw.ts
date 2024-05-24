import { assign } from "lodash";

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
        manage: "管理",
        orderSentences: "排列句子",
        clozeTest: "填空測試",
        orderWords: "排序單詞",
        matching: "匹配",
        flashcardDescription:
          "您可以使用單詞卡來練習您的閱讀技能，您保存的句子將在這裡顯示。",
        savedSentences: "保存的句子",
        noSavedSentences: "您沒有保存的句子。",
        savedSentencesDescription: "您有 {total} 個保存的句子。",
        added: "添加於 {date}",
        deleteButton: "刪除",
        neverPracticeButton: "不用再练习这个句子了",
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
          nextButton: "下一個",
          yourXp: "您已經獲得了 {xp} XP 為這項活動。",
        },
        orderSentencesPractice: {
          orderSentences: "排列句子",
          orderSentencesDescription:
            "这是你读过的一篇文章中的一些句子。请将这些句子排列成对你有意义的顺序。如果顺序与文章中的相同，你将获得5经验值。",
          saveOrder: "儲存 & 稍後繼續",
          errorOrder: "請正確排序",
        },
        clozeTestPractice: {
          clozeTest: "填空測試",
          clozeTestDescription:
            "這是你讀過的一篇文章中的幾個句子，請填入遺失的單詞以完成它們。如果你答對了，你將獲得5經驗值。",
          saveOrder: "儲存 & 稍後繼續",
          errorOrder: "請正確排序",
        },
        orderWordsPractice: {
          orderWords: "排序單詞",
          orderWordsDescription:
            "這是你讀過的文章中的一句話。請將單詞按對你有意義的順序排列。如果順序與文章中的相同，你將獲得5經驗值。",
          saveOrder: "繼續",
          errorOrder: "請正確排序",
          submitArticle: "檢查您的答案",
          nextPassage: "下一段",
          tryToSortThisSentence: "試著排序這句話",
        },
        matchingPractice: {
          matching: "配對",
          matchingDescription:
            "將句子與其翻譯配對。如果您正確配對所有句子，您將獲得5 XP。",
          saveOrder: "儲存並稍後繼續",
          errorOrder: "請正確排序",
          submitArticle: "檢查您的答案",
          nextPassage: "下一篇章",
          minSentencesAlert: "您至少需要儲存五個句子才能進行此活動。",
        },
      },
    },
    teacher: {
      studentProgressPage: {
        activity: "活動",
        level: "等級",
        levelDescription: "您當前的等級是 {level}",
        progressOf: "{nameOfStudent} 的進度",
        noUserProgress: "沒有用戶進度，因為學生從未閱讀過文章或進行其他活動。",
      },
    }
    
  },
  components: {
    mainNav: {
      home: "主頁",
      about: "關於",
      contact: "聯繫",
      authors: "作者",
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
      sentences: "句子",
      reports: "報告",
     
    },
    sidebarTeacherNav: {
      myClasses: "我的課程",
      myStudents: "我的學生",
      classRoster: "班級名單",
      reports: "報告",
      passages: "段落",
      assignments: "作業",
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
      congratulations: "恭喜！ ",
      upLevel: "您已获得新级别!",
      close: "關閉",
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
      content: "你如何評價這篇文章的質量？",
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

    passage: {
    heading: "段落",
    type: "類型",
    fiction: "小說",
    nonFiction: "非小說類",
    topic: "主題",
    selectGenre: "選擇類型",
    selectSubGenre: "選擇子流派",
    level: "級別",
    },

    myClasses: {
      title: "我的班級",
      search: "搜尋班級名稱...",
      className: "班級名稱",
      classCode: "班級代碼",
      studentCount: "學生人數",
      actions: "操作",
      detail: "詳情",
      roster: "名單",
      reports: "報告",
    
      createNewClass: {
        button: "創建新班級",
        title: "創建新班級",
        description: "填寫資料以創建新班級",
        className: "班級名稱",
        selectGrade: "選擇年級",
        grade: "年級",
        create: "創建班級",
        cancel: "取消",
        toast: {
          attention: "注意",
          attentionDescription: "所有欄位必須填寫！",
          successCreate: "成功",
          successDescription: "班級創建成功",
        },
      },
    
      edit: {
        title: "編輯班級詳情",
        description: "更新下方的班級詳情",
        className: "班級名稱",
        selectGrade: "選擇年級",
        grade: "年級",
        toast: {
          attention: "注意",
          attentionDescription: "所有欄位必須填寫！",
          successUpdate: "更新成功",
          successUpdateDescription: "班級更新成功",
        },
        update: "更新班級",
        cancel: "取消",
      },
    
      archieve: {
        title: "歸檔班級",
        descriptionBefore: "您是否要歸檔",
        descriptionAfter: "班級？",
        archive: "歸檔",
        cancel: "取消",
        toast: {
          successArchive: "班級已歸檔",
          successArchiveDescription: "班級已成功歸檔！",
          errorArchive: "錯誤",
          errorArchiveDescription: "歸檔班級時發生錯誤",
        },
      },
    
      delete: {
        title: "刪除班級",
        descriptionBefore: "您是否要刪除",
        descriptionAfter: "班級？",
        delete: "刪除",
        cancel: "取消",
        toast: {
          successDelete: "班級已刪除",
          successDeleteDescription: "班級已成功刪除",
          errorDelete: "錯誤",
          errorDeleteDescription: "刪除班級時發生錯誤",
        },
      },
    },

    myStudent: {
      title: "我的學生",
      name: "姓名",
      email: "電子郵件",
      searchName: "搜尋姓名...",
      actions: "操作",
      progress: "進度",
      enroll: "註冊",
      unEnroll: "取消註冊",
      resetProgress: "重置進度",
      resetTitle: "重置所有XP進度",
      resetDescription: "您確定要重置所有進度嗎？",
      reset: "重置",
      cancelReset: "取消",
    
      enrollPage: {
        title: "{studentName}可註冊的班級",
        add: "添加",
        search: "搜尋...",
        className: "班級名稱",
        enroll: "註冊",
        toast: {
          successEnrollment: "註冊成功",
          successEnrollDescription: "學生已註冊到班級",
          errorEnrollment: "註冊失敗",
          errorEnrollDescription: "學生未能註冊到班級",
        }
      }, 
      unEnrollPage: {
        title: "{studentName}取消註冊的班級",
        remove: "移除",
        search: "搜尋...",
        className: "班級名稱",
        unEnroll: "取消註冊",
        toast: {
          successUnenrollment: "移除成功",
          successUnenrollDescription: "學生已從班級移除",
          errorUnenrollment: "取消註冊失敗",
          errorUnenrollDescription: "學生未能從班級移除",
        }
      },
    },

    classRoster: {
      title: "班級名單：{className}",
      description: "請從我的班級中選擇班級",
      name: "姓名",
      lastActivity: "最後活動",
      actions: "操作",
      search: "搜尋姓名...",
      noStudent: "此班級中沒有學生",
      addStudentButton: "添加新學生",
      toast: {
        successResetProgress: "成功重置進度",
        successResetProgressDescription: "所有進度已重置",
      },
    
      addNewStudent: {
        title: "添加新學生到 {className}",
        description: "通過輸入他們的電子郵件地址將新學生添加到班級。",
        email: "電子郵件：",
        placeholder: "輸入電子郵件地址",
        addStudent: "添加新學生",
        warning: "要添加學生，請填寫上面的必填字段。",
        saveButton: "保存並繼續",
        toast: {
          successAddStudent: "學生已添加",
          successAddStudentDescription: "學生已成功添加到此班級。",
          errorAddStudent: "添加學生失敗",
          errorAddStudentDescription: "未能將學生添加到此班級。",
          emailNotFound: "未找到電子郵件",
          emailNotFoundDescription: "此電子郵件地址未關聯任何賬戶。請檢查拼寫或嘗試不同的電子郵件地址。",
        }
      },
    },
    
    reports: {
      title: "班級報告：{className}",
      averageLevel: "平均等級：",
      name: "姓名",
      xp: "XP",
      level: "等級",
      search: "搜索姓名...",
      lastActivity: "最後活動",
      actions: "操作",
      detail: "詳情",
      viewDetails: "查看詳情",
      noStudent: "此班級中沒有學生",
      noStudentDescription: "請從我的班級中選擇班級",
    
      editStudent: {
        title: "編輯學生詳情",
        description: "更新以下學生詳情",
        placeholder: "學生姓名",
        update: "更新學生",
        cancel: "取消",
        toast: {
          successUpdate: "更新成功",
          successUpdateDescription: "學生信息更新成功",
          attentionUpdate: "注意",
          attentionUpdateDescription: "請填寫信息",
          errorUpdate: "更新失敗",
          errorUpdateDescription: "更新學生信息失敗",
        }
      },
      removeStudent: {
        title: "移除學生",
        descriptionBefore: "你想要移除",
        descriptionAfter: "從這個班級嗎？",
        remove: "移除",
        cancel: "取消",
        toast: {
          successRemove: "學生移除成功",
          successRemoveDescription: "學生已成功移除",
          errorRemove: "錯誤",
          errorRemoveDescription: "移除學生時出錯",
        }
      },
    },
    
  },
} as const;
