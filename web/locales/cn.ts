export default {
  pages: {
    indexPage: {
      description: "综合阅读应用, 集成了AI。目前正在进行Beta测试。",
      getStartedButton: "开始",
    },
    loginPage: {
      loginDescription: "登录到您的账户",
      backButton: "返回",
    },
    student: {
      readPage: {
        articleSelection: "文章选择",
        article: {
          articleNotFound: "找不到文章",
          articleInsufficientLevel: "您的阅读水平不足，无法阅读此文章。",
          readBefore: "您之前读过这篇文章",
          readBeforeDescription:
            "您可以再次阅读并练习，以提高您的阅读技能。这是您之前阅读的结果。",
          status: "状态",
          statusText: {
            completed: "已完成",
            uncompleted: "未完成",
          },
          statusDescription: "最后更新于 {date}",
          score: "测验分数",
          scoreText: "{score}",
          scoreDescription: "共 {total} 个问题",
          rated: "已评分",
          ratedText: "{rated} 分",
          ratedDescription: "您对这篇文章的评分",
          timeSpend: "花费时间",
          timeSpendText: "{time}",
          timeSpendDescription: "在 {total} 个问题中",
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
        reminderToReread: "重读提醒",
        articleRecords: "文章记录",
        reminderToRereadDescription:
          "您可能想再次尝试阅读这些文章，以查看您是否有所提高。",
        articleRecordsDescription: "您的阅读记录将在这里显示。",
      },
      practicePage: {
        flashcard: "单词卡",
        manage: "管理",
        orderSentences: "排列句子",
        clozeTest: "填空测试",
        orderWords: "排序单词",
        matching: "匹配",
        flashcardDescription:
          "您可以使用单词卡来练习您的阅读技能，您保存的句子将在这里显示。",
        savedSentences: "保存的句子",
        noSavedSentences: "您没有保存的句子。",
        savedSentencesDescription: "您有 {total} 个保存的句子。",
        added: "添加于 {date}",
        deleteButton: "删除",
        neverPracticeButton: "不用再练习这个句子了",
        toast: {
          success: "成功",
          successDescription: "成功删除保存的句子",
          error: "错误",
          errorDescription: "删除保存的句子时出错",
        },
        flashcardPractice: {
          buttonEasy: "容易",
          buttonHard: "难",
          buttonGood: "好",
          buttonAgain: "再来",
          flipCard: "翻转",
          nextButton: "下一个",
          yourXp: "您已经获得了 {xp} XP 为这个活动。",
        },
        orderSentencesPractice: {
          orderSentences: "排列句子",
          orderSentencesDescription:
            "这些是你读过的某篇文章中的一些句子。请按照对你有意义的顺序排列这些句子。如果顺序与文章中的相同，你将获得5经验值。",
          saveOrder: "保存并稍后继续",
          errorOrder: "请正确排序",
        },
        clozeTestPractice: {
          clozeTest: "填空测试",
          clozeTestDescription:
            "这是你读过的一篇文章中的几个句子，请填写缺失的单词以完成它们。如果你回答正确，你将获得5经验值。",
          submitButton: "提交",
          errorCloze: "请填写所有空白处",
        },
        orderWordsPractice: {
          orderWords: "排序单词",
          orderWordsDescription:
            "这是你读过的一段文字中的一句。请将这些单词按对你有意义的顺序排列。如果这些单词的顺序与文章中的相同，你将获得5经验点。",
          saveOrder: "继续",
          errorOrder: "请正确排序",
          submitArticle: "检查你的答案",
          nextPassage: "下一段落",
          tryToSortThisSentence: "尝试排序这个句子",
        },
        matchingPractice: {
          matching: "配对",
          matchingDescription:
            "将句子与其翻译进行匹配。如果你正确匹配了所有句子，你将获得5 XP。",
          saveOrder: "保存并稍后继续",
          errorOrder: "请正确排序",
          submitArticle: "检查你的答案",
          nextPassage: "下一段",
          minSentencesAlert: "您至少需要保存五个句子才能进行这项活动。",
        },
      },
    },
  },
  components: {
    mainNav: {
      home: "主页",
      about: "关于",
      contact: "联系",
      authors: "作者",
    },
    userAccountNav: {
      level: "等级 {level}",
      settings: "设置",
      signOut: "登出",
    },
    themeSwitcher: {
      dark: "暗模式",
      light: "亮模式",
      system: "系统",
    },
    localeSwitcher: {
      en: "English",
      th: "ไทย",
      cn: "简体字",
      tw: "繁體字",
      vi: "Tiếng Việt",
    },
    sidebarNav: {
      read: "阅读",
      history: "历史",
      sentences: "句子",
      reports: "报告",
    },
    sidebarTeacherNav: {
      myClasses: "我的课程",
      myStudents: "我的学生",
      classRoster: "班级名单",
      reports: "报告",
      passages: "段落",
      assignments: "作业",
    },
    articleRecordsTable: {
      title: "标题",
      date: "日期",
      rated: "已评分",
      search: "搜索标题...",
      previous: "上一个",
      next: "下一个",
      select: "已选择 {selected} 个，共 {total} 个",
    },
    firstRunLevelTest: {
      heading: "让我们开始测试你的技能吧！",
      description: "选择正确的答案来评估您的阅读水平。",
      nextButton: "下一个",
      section: "部分 {currentSectionIndex}",
      toast: {
        successUpdate: "成功！",
        successUpdateDescription: "您的经验和等级已更新。",
        attention: "注意",
        attentionDescription: "请回答所有问题!",
        errorTitle: "出了点问题。",
        errorDescription: "您的经验和等级未更新。请重试。",
      },
      congratulations: "恭喜!",
      congratulationsDescription: "评估完成。",
      yourScore: "你的分数 : {xp}",
      yourCefrLevel: "你的 CEFR 等级 : {cefrLevel}",
      yourRaLevel: "你的 RA 级别 : {raLevel}",
      getStartedButton: "开始",
    },
    progressBarXp: {
      xp: "经验: ",
      level: "等级 {level}",
      congratulations: "恭喜!",
      upLevel: "您已獲得新等級！",
      close: "关闭",
    },
    select: {
      articleChoose: "请选择您想阅读的 {article}",
      articleChooseDescription:
        "您的级别是 {level}，这里是您可以选择的 {article}。",
    },
    article: {
      type: "文章类型",
      genre: "文章种类",
      subGenre: "文章子类",
      article: "文章",
    },
    articleCard: {
      raLevel: "阅读能力等级为 {raLevel}",
      cefrLevel: "CEFR 等级为 {cefrLevel}",
      articleCardDescription: "该文章涉及 {topic} 主题，属于 {genre} 类别。",
    },
    articleContent: {
      voiceAssistant: "语音助手",
      soundButton: {
        play: "播放声音",
        pause: "暂停声音",
      },
      // button translate
      translateฺButton: {
        open: "翻译",
        close: "關閉翻譯視窗",
      },
    },
    mcq: {
      quiz: "测验",
      reQuiz: "重新测验",
      quizDescription:
        "开始测验以测试您的知识，并看看这篇文章对您来说有多容易。",
      reQuizDescription:
        "您之前完成过这个测验。您可以重新参加测验以提高您的分数。",
      startButton: "开始测验",
      retakeButton: "重新测验",
      elapsedTime: "已用时间 {time} 秒",
      questionHeading: "问题 {number}，共 {total} 个",
      nextQuestionButton: "下一个问题",
      toast: {
        correct: "正确",
        correctDescription: "您答对了！",
        incorrect: "错误",
        incorrectDescription: "您答错了！",
        quizCompleted: "测验完成",
        quizCompletedDescription: "您已完成测验",
        error: "错误",
        errorDescription: "提交答案时出错，请稍后再试。",
      },
    },
    rate: {
      title: "评价这篇文章",
      content: "你如何评价本文的质量?",
      description: "此评分用于计算您下一级别。",
      newLevel: "您的新级别是 {level}",
      submitButton: "提交",
      backToHomeButton: "返回主页",
      nextQuizButton: "下一个测验",
      toast: {
        success: "成功",
        successDescription: "您的新级别是 {level}。",
      },
    },
    audioButton: {
      play: "播放声音",
      pause: "暂停声音",
    },
    menu: "菜单",
    loginButton: "登录",
    
    passages: {
      heading: "段落",
      type: "类型",
      fiction: "小说",
      nonFiction: "非小说类",
      topic: "主题",
      selectGenre: "选择类型",
      selectSubGenre: "选择子流派",
      level: "级别",
    },
    myClasses: {
      title: '我的课程',
      search: '搜索班级名称...',
      className: '班级名称',
      classCode: '班级代码',
      studentCount: '学生人数',
      actions: '操作',
      detail: '细节',
      roster: '名册',
      reports: '报告',
      createNewClass: {
        button: '创建新类',
        title: '创建新类',
        description: '填写详细信息以创建新课程',
        className: '班级名称',
        selectGrade: '选择年级',
        grade: '年级',
        create: '创建班级',
        cancel: '取消',
        toast: {
          attention: '注意力',
          attentionDescription: '所有字段必须填写！',
          successCreate: '成功',
          successDescription: '班级创建成功'
        }
      },
      edit: {
        title: '编辑班级详细信息',
        description: '更新以下课程详细信息',
        className: '班级名称',
        selectGrade: '选择年级',
        grade: '年级',
        toast: {
          attention: '注意力',
          attentionDescription: '所有字段必须填写！',
          successUpdate: '更新成功',
          successUpdateDescription: '课程更新成功'
        },
        update: '更新类',
        cancel: '取消'
      },
      archieve: {
        title: '存档类',
        descriptionBefore: '是否要存档',
        descriptionAfter: ' 班级？',
        archive: '档案',
        cancel: '取消',
        toast: {
          successArchive: '课程已归档',
          successArchiveDescription: '课程已成功存档！',
          errorArchive: '错误',
          errorArchiveDescription: '归档课程时出错'
        }
      },
      delete: {
        title: '删除课堂',
        descriptionBefore: '是否要删除',
        descriptionAfter: '教室？',
        delete: '删除',
        cancel: '取消',
        toast: {
          successDelete: '课程已删除',
          successDeleteDescription: '课程已成功删除',
          errorDelete: '错误',
          errorDeleteDescription: '删除课程时出错'
        }
      }
    },

    myStudent: {
      title: "我的学生",
      name: "姓名",
      email: "电子邮件",
      searchName: "搜索姓名...",
      actions: "操作",
      progress: "进度",
      enroll: "注册",
      unEnroll: "取消注册",
      resetProgress: "重置进度",
      resetTitle: "重置所有XP进度",
      resetDescription: "您确定要重置所有进度吗？",
      reset: "重置",
      cancelReset: "取消",
    
      enrollPage: {
        title: "{studentName}可注册的班级",
        add: "添加",
        search: "搜索...",
        className: "班级名称",
        enroll: "注册",
        toast: {
          successEnrollment: "注册成功",
          successEnrollDescription: "学生已注册到班级",
          errorEnrollment: "注册失败",
          errorEnrollDescription: "学生未能注册到班级",
        }
      }, 
      unEnrollPage: {
        title: "{studentName}取消注册的班级",
        remove: "移除",
        search: "搜索...",
        className: "班级名称",
        unEnroll: "取消注册",
        toast: {
          successUnenrollment: "移除成功",
          successUnenrollDescription: "学生已从班级移除",
          errorUnenrollment: "取消注册失败",
          errorUnenrollDescription: "学生未能从班级移除",
        }
      },
    },

    classRoster: {
      title: "班级名单：{className}",
      description: "请从我的班级中选择班级",
      name: "姓名",
      lastActivity: "最后活动",
      actions: "操作",
      search: "搜索姓名...",
      noStudent: "此班级中没有学生",
      addStudentButton: "添加新学生",
      toast: {
        successResetProgress: "成功重置进度",
        successResetProgressDescription: "所有进度已重置",
      },
    
      addNewStudent: {
        title: "添加新学生到 {className}",
        description: "通过输入他们的电子邮件地址将新学生添加到班级。",
        email: "电子邮件：",
        placeholder: "输入电子邮件地址",
        addStudent: "添加新学生",
        warning: "要添加学生，请填写上面的必填字段。",
        saveButton: "保存并继续",
        toast: {
          successAddStudent: "学生已添加",
          successAddStudentDescription: "学生已成功添加到此班级。",
          errorAddStudent: "添加学生失败",
          errorAddStudentDescription: "未能将学生添加到此班级。",
          emailNotFound: "未找到电子邮件",
          emailNotFoundDescription: "此电子邮件地址未关联任何账户。请检查拼写或尝试不同的电子邮件地址。",
        }
      },
    },

    reports: {
      title: "班级报告：{className}",
      averageLevel: "平均等级：",
      name: "姓名",
      xp: "XP",
      level: "等级",
      search: "搜索姓名...",
      lastActivity: "最后活动",
      actions: "操作",
      detail: "详情",
      viewDetails: "查看详情",
      noStudent: "此班级中没有学生",
      noStudentDescription: "请从我的班级中选择班级",
    
      editStudent: {
        title: "编辑学生详情",
        description: "更新以下学生详情",
        placeholder: "学生姓名",
        update: "更新学生",
        cancel: "取消",
        toast: {
          successUpdate: "更新成功",
          successUpdateDescription: "学生信息更新成功",
          attentionUpdate: "注意",
          attentionUpdateDescription: "请填写信息",
          errorUpdate: "更新失败",
          errorUpdateDescription: "更新学生信息失败",
        }
      },
      removeStudent: {
        title: "移除学生",
        descriptionBefore: "你想要移除",
        descriptionAfter: "从这个班级吗？",
        remove: "移除",
        cancel: "取消",
        toast: {
          successRemove: "学生移除成功",
          successRemoveDescription: "学生已成功移除",
          errorRemove: "错误",
          errorRemoveDescription: "移除学生时出错",
        }
      },
    },

  },
} as const;
