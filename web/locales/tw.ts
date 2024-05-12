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
<<<<<<< HEAD
=======
    // use this for article selection page
    types: {
      // article type
      fiction: "小說",
      // fiction
      "Adventure": "冒险",
      "Horror": " 恐怖",
      "Epic": "史诗",
      "Media": "媒体",
      "Romance": "浪漫",
      "Classic Literature": "經典文學",
      "Western": "西部",
      "Drama": "戏剧",
      "Fantasy": "奇幻",
      "Science Fiction": "科幻小说",
      "Dystopian Fiction": "反乌托邦小说",
      "Mythology": "傳奇",
      "novel": "小说",
      "Folklore": "民俗学",
      "Mystery": "神秘",
      "Comedy": "喜剧",
      "Literary Fiction": "文學小说",
      "Family Drama": "家庭戏剧",
      // Adventure
      "Exploration": "勘探",
      "Animal Adventure": "动物冒险",
      "Treasure Hunt": "寻宝",
      "Historical Fiction": "历史小说",
      "Historical fiction": "历史小说",
      // Horror
      "Psychological Horror": "心理恐怖",
      "Gothic horror": "哥特恐怖",
      "Supernatural": "超自然",
      // media
      "World Literature": "世界文学",
      // romance
      "Young Adult": "青少年",
      "Contemporary Romance": "当代浪漫",
      // Classic Literature
      "Romantic Fiction": "言情小說",
      // western
      "Bounty Hunter": "賞金獵人",
      // drama
      "Coming-of-Age": "成長故事",
      // Historical fiction
      "Legendary": "傳奇",
      // fantasy
      "Time Travel": "時間旅行",
      "Mythical Creatures": "神秘生物",
      "Epic Fantasy": "史詩奇幻",
      "Urban Fantasy": "都市幻想",
      "Magical Realism": "魔幻寫實主義",
      "Supernatural Mystery": "超自然之謎",
      // Science Fiction
      "Space Opera": "太空歌劇",
      "Dystopian": "反烏托邦",
      "Time Travel Comedy": "時間旅行喜劇",
      // dystopian fiction
      "Resistance": "反抗",
      // Mythology
      "Hindu Mythology": "印度神話",
      "Aztec Mythology": "阿茲特克神話",
      "African Mythology": "非洲神話",
      "Andean Mythology": "安第斯神話",
      "Creation Myth": "創世神話",
      "Greek Mythology": "希臘神話",
      // Folklore
      "Eastern European Folklore": "東歐民間傳說",
      // Mystery
      "Detective Fiction": "偵探小說",
      "Psychological Thriller": "心理驚悚片",
      // comedy
      "Superhero": "超級英雄",
      // Historical Fiction
      "Medieval Adventure": "中世紀冒險",
      "Harlem Renaissance": "哈林文藝復興",
      "World War II Resistance": "第二次世界大戰抵抗",
      // Literary Fiction
      "Existential Fiction": "存在主義小說",
      "Modernist Literature": "現代主義文學",
      "Existentialism": "存在主義",
      // Drama
      "Domestic Life": "家庭生活",
      // novel
      "drama": "戲劇",

      /* ------------------------------- */

      // article type non-fiction
      nonfiction: "非小說類",
      // non-fiction
      "Entertainment": "娛樂",
      "Film": "電影",
      "Psychology": "心理學",
      "Social Issues": "社會問題",
      "Earth Science": "地球科學",
      "Science": "科學",
      "Biology": "生物學",
      "History": "歷史",
      "Paranormal": "超自然現象",
      "Arts": "藝術",
      "Environmental Science": "環境科學",
      "True Crime": "真正的犯罪",
      "Technology": "工藝學",
      "Education": "教育",
      "Sociology": "社會學",
      "Art and Technology": "藝術與科技",
      "Natural Science": "自然科學",
      "Biography": "傳記",
      "Business": "商業",
      "Sports": "運動的",
      "Nature": "自然",
      "Self-help": "自助",
      "Travel Guide": "旅遊指南",
      "Memoir": "回憶錄",
      "Health": "健康",
      "Science and Technology": "科學和技術",
      "Religion": "宗教",
      "Educational": "教育性的",
      "Health and Wellness": "健康與保健",
      "Self-Help": "自助",
      "Natural Sciences": "自然科學",
      "Cultural Celebration": "文化慶典",
      "Travel": "旅行",
      "Visual Arts": "視覺藝術",
      "Music": "音樂",
      "Cryptozoology": "隱生動物學",
      "Social Sciences": "社會科學",
      "Medical": "醫療的",
      "Political Science": "政治學",
      "Natural History": "自然史",
      "Religion and Spirituality": "宗教與靈性",
      // Entertainment
      "Podcasts": "播客",
      "Film Industry": "電影業",
      // Psychology
      "Music and Memory": "音樂與記憶",
      "Music Therapy": "音樂治療",
      // Social Issues
      "Indigenous Rights": "原住民權利",
      // Earth Science
      "Natural Disasters": "自然災害",
      // Science
      "The Marvels of Earth's Magnetic Field": "地球磁場的奇蹟",
      "Renewable Energy": "再生能源",
      "Astrophysics": "天文物理學",
      "Geology": "地質學",
      "Scientist": "科學家",
      "Animal Biology": "動物生物學",
      "Ecology": "生態",
      "Paleontology": "古生物學",
      "Physics": "物理",
      "Botany": "植物學",
      "Marine Biology": "海洋生物學",
      "Evolution": "演化",
      "Astronomy": "天文學",
      "Space Exploration": "太空探索",
      "Meteorology": "氣象",
      // Biology
      "Animal Behavior": "動物行為",
      "Animals": "動物",
      "Wildlife": "野生動物",
      "Organismal Biology": "有機體生物學",
      "Herpetology": "爬蟲學",
      "Aquatic Life": "水生生物",
      "Animal Adaptations": "動物適應",    
      // History
      "Medieval History": "中世紀歷史",
      "Ancient Egypt": "古埃及",
      "Invention and Technology": "發明與技術",
      "European History": "歐洲歷史",
      "World War II": "第二次世界大戰",
      "War": "戰爭",
      "Military History": "軍事史",
      "Invention": "發明",
      "Ancient Rome": "古羅馬",
      "Ancient Civilization": "古代文明",
      "Ancient History": "古代歷史",
      "Transportation and Communication": "交通通訊",
      "Ancient Civilizations": "古代文明",
      "Islamic History": "伊斯蘭歷史",
      "Modern History": "近代史",
      "Revolution": "革命",
      // Paranormal
      "Haunted Locations": "鬧鬼地點",
      // Arts
      "Art Techniques": "藝術技巧",
      "Comics and Graphic Novels": "漫畫和圖像小說",
      "Screenwriting": "編劇",
      // Environmental Science
      "Marine Pollution": "海洋污染",
      "Land Degradation": "土地退化",

      // True Crime
      "Serial Killers": "連續殺人犯",
      // Technology
      "Wearable Technology": "穿戴式科技",
      "History and Evolution": "歷史與演變",
      "Mobile Technology": "行動技術",
      "Internet": "網際網路",
      "History and Impact": "歷史和影響",
      // Education
      "STEAM Education": "蒸氣教育",
      "Technology in Education": "教育科技",
      "Diversity and Inclusion": "多元化和包容性",
      // Sociology
      "Global Collaboration": "全球合作",
      // Art and Technology
      "Digital Art": "數位藝術",
      // Natural Science
      "Aquatic Biology": "水生生物學",
      "Wildlife Biology": "野生動物生物學",
      // Biography
      "Inventors": "發明家",
      "Historical Biography": "歷史傳記",
      "Art History": "藝術史",
      "Civil Rights Movement": "民權運動",
      "Philosophy": "哲學",
      // Business
      "Art Entrepreneurship": "藝術創業",
      // sports
      "Sports Media": "體育媒體",
      "Inspirational": "勵志",
      "Media Coverage": "媒體報道",
      "Women in Sports": "女性體育運動",
      // nature
      "Marine Life": "海洋生物",
      "Bird Watching": "賞鳥",
      "Wildlife Conservation": "野生動物保護",
      // Self-help
      "Relationships": "人際關係",
      "Personal Development": "個人發展",
      "Communication Skills": "溝通技巧",
      // Travel Guide
      "City Guide": "城市指南",
      // Memoir
      "Medical Memoir": "醫學回憶錄",
      // Horror
      "Legends": "傳奇",
      // Health
      "Medical Profession": "醫學界",
      "Public Health": "公共衛生",
      "Epidemiology": "流行病學",
      // Science and Technology
      "Home Appliances": "家用電器",
      "Music Technology": "音樂技術",
      "History and Innovation": "歷史與創新",
      // Religion
      "Judaism": "猶太教",
      // Educational
      "Media Literacy": "媒體素養", 
      // Health and Wellness
      "Physical Fitness": "身體素質",
      "Alternative Medicine": "替代藥物",    
      "Fitness": "健康",
      // Self-help
      "Time Management": "時間管理",
      // Natural Sciences
      // Cultural Celebration 
      "Indigenous Festivals": "原住民節日",
      "Traditional Festival": "傳統節日",
      // Travel
      "Travel Guides": "旅遊指南",
      "Cultural Festival": "文化節", 
      // Visual Arts
      "Film and Fine Art": "電影與美術",
      // Music
      "Biographies": "傳記",    
      "Social Issues in Music": "音樂中的社會議題",
      "History of Music Innovation": "音樂創新史",
      "Musical Collaboration": "音樂合作",
      "Exploration of Music Genres": "音樂流派的探索", 
      "Musical Collaborations": "音樂合作",
      "Music History": "音樂史",
      // "Cryptozoology   
      "Legendary Creatures": "傳說生物",
      "Cryptids": "怪物",
      "Cryptids and Mythical Beasts": "怪物和神獸",
      // Mythology
      "Australian Aboriginal Mythology": "澳洲原住民神話", 
      "Australian Aboriginal": "澳洲原住民",
      // Social Sciences
      // Medical
      "Cardiology": "心臟病學",    
      // Political Science
      "Global Governance": "全球治理",
      // Natural History
      "Birds": "鳥類",
      "Extinction and Conservation": "滅絕與保護",
      "Evolutionary Biology": "演化生物學", 
      "Insects": "昆蟲",
      "Ornithology": "鳥類學",    
      "Arctic Wildlife": "北極野生動物",
      "Mammalogy": "哺乳動物學",
      "Prehistoric Animals": "史前動物",
      // Religion and Spirituality
      "Indigenous Beliefs": "原住民信仰", 
    },

>>>>>>> 2b400a1 (rebase commit)
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
  },
} as const;
