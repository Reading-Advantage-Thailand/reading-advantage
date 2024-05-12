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
<<<<<<< HEAD
=======

    // use this for article selection page
    types: {
      // article type
      fiction: "小说",
      // fiction
      "Adventure": "冒险",
      "Horror": "恐怖",
      "Epic": "史诗",
      "Media": "媒体",
      "Romance": "浪漫",
      "Classic Literature": "经典文学",
      "Western": "西部",
      "Drama": "戏剧",
      "Fantasy": "奇幻",
      "Science Fiction": "科幻小说",
      "Dystopian Fiction": "反乌托邦小说",
      "Mythology": "神话",
      "novel": "小说",
      "Folklore": "民俗學",
      "Mystery": "神秘",
      "Comedy": "喜剧",
      "Literary Fiction": "文学小说",
      "Family Drama": "家庭戏剧",
      // Adventure
      "Exploration": "勘探",
      "Animal Adventure": "动物冒险",
      "Treasure Hunt": "寻宝",
      "Historical Fiction": "历史小说",
      "Historical fiction": "历史小说",
      // Horror
      "Psychological Horror": "心理恐怖",
      "Gothic horror": "哥特式恐怖",
      "Supernatural": "超自然",
      // media
      "World Literature": "世界文学",
      // romance
      "Young Adult": "青少年",
      "Contemporary Romance": "当代浪漫",
      // Classic Literature
      "Romantic Fiction": "浪漫小说",
      // western
      "Bounty Hunter": "赏金猎人",
      // drama
      "Coming-of-Age": "即将成年",
      // Historical fiction
      "Legendary": "传奇",
      // fantasy
      "Time Travel": "时间旅行",
      "Mythical Creatures": "神话生物",
      "Epic Fantasy": "史诗奇幻",
      "Urban Fantasy": "都市奇幻",
      "Magical Realism": "魔幻现实主义",
      "Supernatural Mystery": "超自然神秘",
      // Science Fiction
      "Space Opera": "太空歌剧",
      "Dystopian": "反乌托邦",
      "Time Travel Comedy": "时间旅行喜剧",
      // dystopian fiction
      "Resistance": "阻力",
      // Mythology
      "Hindu Mythology": "印度神话",
      "Aztec Mythology": "阿兹特克神话",
      "African Mythology": "非洲神话",
      "Andean Mythology": "安第斯神话",
      "Creation Myth": "创世神话",
      "Greek Mythology": "希腊神话",
      // Folklore
      "Eastern European Folklore": "东欧民间传说",
      // Mystery
      "Detective Fiction": "侦探小说",
      "Psychological Thriller": "心理惊悚",
      // comedy
      "Superhero": "超级英雄",
      // Historical Fiction
      "Medieval Adventure": "中世纪冒险",
      "Harlem Renaissance": "哈莱姆文艺复兴",
      "World War II Resistance": "第二次世界大战抵抗",
      // Literary Fiction
      "Existential Fiction": "存在主义小说",
      "Modernist Literature": "现代主义文学",
      "Existentialism": "存在主义",
      // Drama
      "Domestic Life": "家庭生活",
      // novel
      "drama": "戏剧",

      /* ------------------------------- */

      // article type non-fiction
      nonfiction: "非虚构",
      // non-fiction
      "Entertainment": "娱乐",
      "Film": "电影",
      "Psychology": "心理学",
      "Social Issues": "社会问题",
      "Earth Science": "地球科学",
      "Science": "科学",
      "Biology": "生物学",
      "History": "历史",
      "Paranormal": "超自然现象",
      "Arts": "艺术",
      "Environmental Science": "环境科学",
      "True Crime": "真实犯罪",
      "Technology": "技术",
      "Education": "教育",
      "Sociology": "社会学",
      "Art and Technology": "艺术与技术",
      "Natural Science": "自然科学",
      "Biography": "传记",
      "Business": "商业",
      "Sports": "体育",
      "Nature": "自然",
      "Self-help": "自助",
      "Travel Guide": "旅行指南",
      "Memoir": "回忆录",
      "Health": "健康",
      "Science and Technology": "科学与技术",
      "Religion": "宗教",
      "Educational": "教育",
      "Health and Wellness": "健康与养生",
      "Self-Help": "自助",
      "Natural Sciences": "自然科学",
      "Cultural Celebration": "文化庆祝",
      "Travel": "旅游",
      "Visual Arts": "视觉艺术",
      "Music": "音乐",
      "Cryptozoology": "神秘动物学",
      "Social Sciences": "社会科学",
      "Medical": "医疗的",
      "Political Science": "政治学",
      "Natural History": "自然历史",
      "Religion and Spirituality": "宗教与灵性",
      // Entertainment
      "Podcasts": "播客",
      "Film Industry": "电影工业",
      // Psychology
      "Music and Memory": "音乐与记忆",
      "Music Therapy": "音乐疗法",
      // Social Issues
      "Indigenous Rights": "土著权利",
      // Earth Science
      "Natural Disasters": "自然灾害",
      // Science
      "The Marvels of Earth's Magnetic Field": "地球磁场的奇迹",
      "Renewable Energy": "可再生能源",
      "Astrophysics": "天体物理学",
      "Geology": "地质学",
      "Scientist": "科学家",
      "Animal Biology": "动物生物学",
      "Ecology": "生态学",
      "Paleontology": "古生物学",
      "Physics": "物理学",
      "Botany": "植物学",
      "Marine Biology": "海洋生物学",
      "Evolution": "进化论",
      "Astronomy": "天文学",
      "Space Exploration": "太空探索",
      "Meteorology": "气象学",
      // Biology
      "Animal Behavior": "动物行为",
      "Animals": "动物",
      "Wildlife": "野生动物",
      "Organismal Biology": "有机体生物学",
      "Herpetology": "爬行动物学",
      "Aquatic Life": "水生生物",
      "Animal Adaptations": "动物适应",    
      // History
      "Medieval History": "中世纪历史",
      "Ancient Egypt": "古埃及",
      "Invention and Technology": "发明与技术",
      "European History": "欧洲历史",
      "World War II": "第二次世界大战",
      "War": "战争",
      "Military History": "军事史",
      "Invention": "发明",
      "Ancient Rome": "古罗马",
      "Ancient Civilization": "古代文明",
      "Ancient History": "古代历史",
      "Transportation and Communication": "交通与通信",
      "Ancient Civilizations": "古代文明",
      "Islamic History": "伊斯兰历史",
      "Modern History": "现代历史",
      "Revolution": "革命",
      // Paranormal
      "Haunted Locations": "鬼屋地点",
      // Arts
      "Art Techniques": "艺术技巧",
      "Comics and Graphic Novels": "漫画与图像小说",
      "Screenwriting": "编剧",
      // Environmental Science
      "Marine Pollution": "海洋污染",
      "Land Degradation": "土地退化",

      // True Crime
      "Serial Killers": "连环杀手",
      // Technology
      "Wearable Technology": "可穿戴技术",
      "History and Evolution": "历史与演变",
      "Mobile Technology": "移动技术",
      "Internet": "互联网",
      "History and Impact": "历史与影响",
      // Education
      "STEAM Education": "水蒸氣教育",
      "Technology in Education": "教育技术",
      "Diversity and Inclusion": "多样性与包容性",
      // Sociology
      "Global Collaboration": "全球合作",
      // Art and Technology
      "Digital Art": "数字艺术",
      // Natural Science
      "Aquatic Biology": "水生生物学",
      "Wildlife Biology": "野生生物学",
      // Biography
      "Inventors": "发明家",
      "Historical Biography": "历史传记",
      "Art History": "艺术史",
      "Civil Rights Movement": "民权运动",
      "Philosophy": "哲学",
      // Business
      "Art Entrepreneurship": "艺术创业",
      // sports
      "Sports Media": "体育媒体",
      "Inspirational": "启发",
      "Media Coverage": "媒体报道",
      "Women in Sports": "女性运动",
      // nature
      "Marine Life": "海洋生物",
      "Bird Watching": "观鸟",
      "Wildlife Conservation": "野生动物保护",
      // Self-help
      "Relationships": "关系",
      "Personal Development": "个人发展",
      "Communication Skills": "沟通技巧",
      // Travel Guide
      "City Guide": "城市指南",
      // Memoir
      "Medical Memoir": "医学回忆录",
      // Horror
      "Legends": "传奇",
      // Health
      "Medical Profession": "医疗行业",
      "Public Health": "公共卫生",
      "Epidemiology": "流行病学",
      // Science and Technology
      "Home Appliances": "家电",
      "Music Technology": "音乐技术",
      "History and Innovation": "历史与创新",
      // Religion
      "Judaism": "犹太教",
      // Educational
      "Media Literacy": "媒体素养", 
      // Health and Wellness
      "Physical Fitness": "身体素质",
      "Alternative Medicine": "替代医学",    
      "Fitness": "健身",
      // Self-help
      "Time Management": "时间管理",
      // Natural Sciences
      // Cultural Celebration 
      "Indigenous Festivals": "民间节日",
      "Traditional Festival": "传统节日",
      // Travel
      "Travel Guides": "旅行指南",
      "Cultural Festival": "文化节", 
      // Visual Arts
      "Film and Fine Art": "电影与艺术",
      // Music
      "Biographies": "传记",    
      "Social Issues in Music": "音乐中的社会问题",
      "History of Music Innovation": "音乐创新的历史",
      "Musical Collaboration": "音乐合作",
      "Exploration of Music Genres": "音乐流派探索", 
      "Musical Collaborations": "音乐合作",
      "Music History": "音乐历史",
      // "Cryptozoology   
      "Legendary Creatures": "传奇生物",
      "Cryptids": "神秘动物",
      "Cryptids and Mythical Beasts": "神秘动物与传奇生物",
      // Mythology
      "Australian Aboriginal Mythology": "澳大利亚原住民传说", 
      "Australian Aboriginal": "澳大利亚原住民",
      // Social Sciences
      // Medical
      "Cardiology": "心脏病学",    
      // Political Science
      "Global Governance": "全球治理",
      // Natural History
      "Birds": "鸟类",
      "Extinction and Conservation": "灭绝与保护",
      "Evolutionary Biology": "进化生物学", 
      "Insects": "昆虫",
      "Ornithology": "鸟类学",    
      "Arctic Wildlife": "北极野生动物",
      "Mammalogy": "哺乳动物学",
      "Prehistoric Animals": "史前动物",
      // Religion and Spirituality
      "Indigenous Beliefs": "土著信仰", 
    },

>>>>>>> 2b400a1 (rebase commit)
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
  },
} as const;
