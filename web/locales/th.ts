export default {
  pages: {
    indexPage: {
      description:
        "แอพพลิเคชั่นสำหรับการอ่านที่ควบคุมและเพิ่มความสามารถในการอ่านด้วย AI ขณะนี้อยู่ระหว่างทดสอบระบบ",
      getStartedButton: "มาเริ่มต้นกันเลย",
    },
    loginPage: {
      loginDescription: "เข้าสู่ระบบด้วยบัญชีของคุณ",
      backButton: "กลับ",
    },
    student: {
      readPage: {
        //Headings
        articleSelection: "การเลือกบทความ",
        // nextquiz/[articleId] page
        article: {
          articleNotFound: "ไม่พบบทความ",
          articleInsufficientLevel:
            "คุณไม่สามารถอ่านบทความนี้ได้เนื่องจากระดับการอ่านของคุณไม่เพียงพอ",
          //headings
          readBefore: "คุณเคยอ่านบนทความนี้แล้ว",
          readBeforeDescription:
            "คุณอาจลองอ่านและฝึกฝนอีกครั้งเพื่อปรับปรุงทักษะการอ่านของคุณ และนี่คือผลลัพธ์จากการอ่านครั้งก่อนหน้า",
          // stats
          status: "สถานะ",
          statusText: {
            completed: "เสร็จสิ้น",
            uncompleted: "ยังไม่เสร็จสิ้น",
          },
          statusDescription: "อัพเดทล่าสุดเมื่อ {date}",
          score: "คะแนนการทำแบบทดสอบ",
          scoreText: "{score}",
          scoreDescription: "จาก {total} คำถาม",
          rated: "คะแนน",
          ratedText: "{rated} คะแนน",
          ratedDescription: "คุณให้คะแนนบทความนี้",
          timeSpend: "เวลาที่ใช้ไป",
          timeSpendText: "{time}",
          timeSpendDescription: "ในการทำแบบทดสอบ {total} คำถาม",
          scoreSuffix: {
            point: "คะแนน",
            points: "คะแนน",
          },
          secondSuffix: {
            second: "วินาที",
            seconds: "วินาที",
          },
        },
      },
      historyPage: {
        //Headings
        reminderToReread: "เตือนในการอ่านซ้ำ",
        articleRecords: "บทความที่อ่านแล้ว",
        //descriptions
        reminderToRereadDescription:
          "คุณอาจต้องการลองอ่านบทความหนึ่งในบทความเหล่านี้อีกครั้งเพื่อดูว่าคุณได้ปรับปรุงการอ่านของคุณได้หรือไม่",
        articleRecordsDescription: "บันทึกการอ่านของคุณจะปรากฏที่นี่",
      },
      practicePage: {
        //Headings
        flashcard: "การ์ดคำศัพท์",
        //descriptions
        flashcardDescription:
          "คุณสามารถฝึกทักษะการอ่านของคุณด้วยการ์ดคำศัพท์ และประโยคที่คุณบันทึกไว้จะปรากฏที่นี่",
        savedSentences: "ประโยคที่บันทึกไว้",
        noSavedSentences: "คุณยังไม่มีประโยคที่บันทึกไว้",
        savedSentencesDescription: "คุณมีประโยคที่บันทึกไว้ {total} ประโยค",
        added: "เพิ่มเมื่อ {date}",
        deleteButton: "ลบ",
        toast: {
          success: "สำเร็จ",
          successDescription: "ลบประโยคที่บันทึกไว้สำเร็จ",
          error: "เกิดข้อผิดพลาด",
          errorDescription: "เกิดข้อผิดพลาดขณะลบประโยคที่บันทึกไว้",
        },
      },
    },
  },
  components: {
    mainNav: {
      home: "หน้าหลัก",
      about: "เกี่ยวกับ",
      contact: "ติดต่อ",
    },
    userAccountNav: {
      level: "ระดับ {level}",
      settings: "การตั้งค่า",
      signOut: "ออกจากระบบ",
    },
    themeSwitcher: {
      dark: "โหมดมืด",
      light: "โหมดสว่าง",
      system: "ตามระบบ",
    },
    localeSwitcher: {
      en: "English",
      th: "ไทย",
      cn: "简体字",
      tw: "繁體字",
      vi: "Tiếng Việt",
    },
    sidebarNav: {
      read: "อ่าน",
      history: "ประวัติ",
      practice: "ฝึก",
      reports: "รายงาน",
    },
    articleRecordsTable: {
      title: "ชื่อบทความ",
      date: "วันที่",
      rated: "คะแนน",
      search: "ค้นหาชื่อบทความ...",
      previous: "ก่อนหน้า",
      next: "ถัดไป",
      select: "{selected} จาก {total} ที่เลือก",
    },
    // use this for article selection page
    // this is the select component
    select: {
      articleChoose: "กรุณาเลือก {article} ที่คุณต้องการอ่าน",
      articleChooseDescription:
        "ระดับของคุณคือ {level} และนี่คือ {article} ที่คุณสามารถเลือกได้",
    },
    // use this for article selection page
    article: {
      type: "ประเภทบทความ",
      genre: "ชนิดของบทความ",
      subGenre: "ชนิดย่อยของบทความ",
      article: "บทความ",
    },
    articleCard: {
      raLevel: "ระดับการอ่านของบทความคือ {raLevel}",
      cefrLevel: "ระดับภาษาของบทความคือ {cefrLevel}",
      // The article pertains to the topic of A clever girl outsmarts an evil sorceress and saves her village from a curse., which falls within the tales and myths genre.
      articleCardDescription:
        "บทความนี้หัวข้อเกี่ยวกับ {topic} ซึ่งอยู่ในประเภท {genre}",
    },
    articleContent: {
      voiceAssistant: "ผู้ช่วยเสียง",
      soundButton: {
        play: "เล่นเสียง",
        pause: "หยุดเสียง",
      },
      // button translate
      translateฺButton: {
        open: "แปลเป็นภาษาไทย",
        close: "ปิดหน้าต่างการแปล",
      },
    },
    mcq: {
      //headings
      quiz: "แบบทดสอบ",
      reQuiz: "ลองทำแบบทดสอบอีกครั้ง",
      //descriptions
      quizDescription:
        "เริ่มทำแบบทดสอบเพื่อทดสอบความรู้ของคุณ และดูว่าบทความนี้ง่ายหรือยากกับคุณ",
      reQuizDescription:
        "คุณได้ทำแบบทดสอบนี้ไปแล้ว คุณสามารถทำแบบทดสอบอีกครั้งเพื่อปรับปรุงคะแนนของคุณ",
      startButton: "เริ่มทำแบบทดสอบ",
      retakeButton: "ทำแบบทดสอบอีกครั้ง",
      // mcq card
      elapsedTime: "ใช้เวลาไป {time} วินาที",
      questionHeading: "คำถามที่ {number} จาก {total}",
      nextQuestionButton: "คำถามต่อไป",
      toast: {
        correct: "ถูกต้อง",
        correctDescription: "คุณตอบถูกต้อง!",
        incorrect: "ผิด",
        incorrectDescription: "คุณตอบผิด!",
        quizCompleted: "ทำแบบทดสอบเสร็จสิ้น",
        quizCompletedDescription: "คุณได้ทำแบบทดสอบเสร็จสิ้นแล้ว",
        error: "เกิดข้อผิดพลาด",
        errorDescription: "เกิดข้อผิดพลาดขณะทำแบบทดสอบ",
      },
    },
    rate: {
      title: "ให้คะแนนบทความ",
      description:
        "การให้คะแนนนี้จะถูกนำไปใช้ในการคำนวณระดับของคุณในครั้งต่อไป",
      newLevel: "ระดับใหม่ของคุณคือ {level}",
      submitButton: "ส่งคะแนน",
      backToHomeButton: "กลับไปหน้าหลัก",
      nextQuizButton: "ไปทำแบบทดสอบต่อไป",
      toast: {
        success: "สำเร็จ",
        successDescription: "ระดับใหม่ของคุณคือ {level}",
      },
    },
    audioButton: {
      play: "เล่นเสียง",
      pause: "หยุดเสียง",
    },
    menu: "เมนู",
    loginButton: "เข้าสู่ระบบ",
  },
} as const;
