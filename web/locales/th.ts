import OrderWords from "@/components/order-words";
import { match } from "assert";

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
        manage: "จัดการ",
        orderSentences: "เรียงประโยค",
        clozeTest: "ทดสอบเติมคำในช่องว่าง",
        orderWords: "เรียงคำ",
        matching: "การจับคู่",
        //descriptions
        flashcardDescription:
          "คุณสามารถฝึกทักษะการอ่านของคุณด้วยการ์ดคำศัพท์ และประโยคที่คุณบันทึกไว้จะปรากฏที่นี่",
        savedSentences: "ประโยคที่บันทึกไว้",
        noSavedSentences: "คุณยังไม่มีประโยคที่บันทึกไว้",
        savedSentencesDescription: "คุณมีประโยคที่บันทึกไว้ {total} ประโยค",
        added: "เพิ่มเมื่อ {date}",
        deleteButton: "ลบ",
        neverPracticeButton: "ไม่ต้องฝึกประโยคนี้อีก",
        toast: {
          success: "สำเร็จ",
          successDescription: "ลบประโยคที่บันทึกไว้สำเร็จ",
          error: "เกิดข้อผิดพลาด",
          errorDescription: "เกิดข้อผิดพลาดขณะลบประโยคที่บันทึกไว้",
        },
        flashcardPractice: {
          buttonAgain: "อีกครั้ง",
          buttonHard: "ยาก",
          buttonGood: "ดี",
          buttonEasy: "ง่าย",
          flipCard: "พลิกการ์ด",
          nextButton: "ถัดไป",
          yourXp: "คุณได้รับ {xp} XP สำหรับกิจกรรมนี้",
        },
        orderSentencesPractice: {
          orderSentences: "เรียงประโยค",
          orderSentencesDescription:
            "นี่คือบางประโยคจากหนึ่งในบทความที่คุณได้อ่าน จัดเรียงประโยคให้มีลำดับที่ดูมีเหตุผลสำหรับคุณ หากลำดับเดียวกันกับในบทความ คุณจะได้รับ 5 XP.",
          saveOrder: "บันทึก & ดำเนินการต่อในภายหลัง",
          errorOrder: "กรุณาเรียงลำดับให้ถูกต้อง",
        },
        clozeTestPractice: {
          clozeTest: "ทดสอบเติมคำในช่องว่าง",
          clozeTestDescription:
            "นี่คือบางประโยคจากหนึ่งในบทความที่คุณได้อ่าน ใส่คำที่ขาดหายไปให้ถูกต้อง หากคุณตอบถูก คุณจะได้รับ 2 XP.",
          saveOrder: "บันทึก & ดำเนินการต่อในภายหลัง",
          errorOrder: "กรุณาเรียงลำดับให้ถูกต้อง",
          submitArticle: "ตรวจสอบคำตอบของคุณ",
          nextPassage: "ตอนต่อไป",
        },
        orderWordsPractice: {
          orderWords: "เรียงคำ",
          orderWordsDescription:
            "นี่คือประโยคหนึ่งจากข้อความที่คุณได้อ่านไปแล้ว จัดเรียงคำให้เป็นประโยคที่มีความหมายสำหรับคุณ หากลำดับคำเหมือนกับในข้อความที่อ่าน คุณจะได้รับ 5 XP.",
          saveOrder: "บันทึก & ดำเนินการต่อในภายหลัง",
          errorOrder: "กรุณาเรียงลำดับให้ถูกต้อง",
          submitArticle: "ตรวจสอบคำตอบของคุณ",
          nextPassage: "ตอนต่อไป",
          tryToSortThisSentence: "ลองเรียงประโยคนี้",
        },
        matchingPractice: {
          matching: "การจับคู่",
          matchingDescription:
            "จับคู่ประโยคกับการแปลของมัน ถ้าคุณจับคู่ทุกประโยคถูกต้อง คุณจะได้รับ 5 XP.",
          saveOrder: "บันทึก & ดำเนินการต่อในภายหลัง",
          errorOrder: "กรุณาเรียงลำดับให้ถูกต้อง",
          submitArticle: "ตรวจสอบคำตอบของคุณ",
          nextPassage: "ตอนต่อไป",
          minSentencesAlert:
            "คุณต้องมีประโยคที่บันทึกไว้อย่างน้อยห้าประโยคเพื่อเล่นกิจกรรมนี้",
        },
      },
    },
  },
  components: {
    mainNav: {
      home: "หน้าหลัก",
      about: "เกี่ยวกับ",
      contact: "ติดต่อ",
      authors: "ผู้เขียน",
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
      sentences: "ประโยค",
      reports: "รายงาน",
    },
    sidebarTeacherNav: {
      myClasses: "ชั้นเรียนของฉัน",
      myStudents: "นักเรียนของฉัน",
      classRoster: "บัญชีรายชื่อนักเรียน",
      reports: "รายงาน",
      passages: "บทความ",
      assignments: "การบ้าน",
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
    firstRunLevelTest: {
      heading: "เริ่มต้นด้วยการทดสอบทักษะของคุณ",
      description: "เลือกคำตอบที่ถูกต้องเพื่อประเมินระดับการอ่านของคุณ",
      nextButton: "ถัดไป",
      section: "ส่วนที่ {currentSectionIndex}",
      toast: {
        successUpdate: "สำเร็จ",
        successUpdateDescription:
          "คะแนนประสบการณ์และระดับของคุณได้รับการอัปเดตแล้ว",
        attention: "คำเตือน",
        attentionDescription: "กรุณาตอบทุกคำถาม!",
        errorTitle: "มีบางอย่างผิดพลาด",
        errorDescription:
          "คะแนนประสบการณ์และระดับของคุณไม่ได้รับการอัปเดต กรุณาลองอีกครั้ง",
      },
      congratulations: "ยินดีด้วย!",
      congratulationsDescription: "การทดสอบเสร็จสิ้นแล้ว",
      yourScore: "คะแนนของคุณคือ {xp}",
      yourCefrLevel: "ระดับภาษาของคุณคือ {cefrLevel}",
      yourRaLevel: "ระดับการอ่านของคุณคือ {raLevel}",
      getStartedButton: "เริ่มกันเลย",
    },
    progressBarXp: {
      xp: "คะแนนประสบการณ์: ",
      level: "ระดับ {level}",
      congratulations: "ยินดีด้วย!",
      upLevel: "คุณได้รับระดับใหม่แล้ว!",
      close: "ปิด",
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
        open: "แปล",
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
      content: "คุณวิจารณ์คุณภาพของบทความนี้อย่างไร?",
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

    passages: {
      heading: "บทความ",
      type: "ประเภท",
      fiction: "นิยาย",
      nonFiction: "สารคดี",
      topic: "หัวข้อ",
      selectGenre: "เลือกประเภท",
      selectSubGenre: "เลือกประเภทย่อย",
      level: "ระดับ",
    },

    myClasses: {
      title: "ชั้นเรียนของฉัน",
      search: "ค้นหาชื่อชั้นเรียน...",
      className: "ชื่อชั้นเรียน",
      classCode: "รหัสชั้นเรียน",
      studentCount: "จำนวนนักเรียน",
      actions: "การดำเนินการ",
      detail: "รายละเอียด",
      roster: "รายชื่อ",
      reports: "รายงาน",
    
      createNewClass: {
        button: "สร้างชั้นเรียนใหม่",
        title: "สร้างชั้นเรียนใหม่",
        description: "กรอกข้อมูลเพื่อสร้างชั้นเรียนใหม่",
        className: "ชื่อชั้นเรียน",
        selectGrade: "เลือกเกรด",
        grade: "เกรด",
        create: "สร้างชั้นเรียน",
        cancel: "ยกเลิก",
        toast: {
          attention: "ความสนใจ",
          attentionDescription: "ต้องกรอกข้อมูลทุกช่อง!",
          successCreate: "สำเร็จ",
          successDescription: "สร้างชั้นเรียนเรียบร้อยแล้ว",
        },
      },
    
      edit: {
        title: "แก้ไขรายละเอียดชั้นเรียน",
        description: "อัปเดตรายละเอียดชั้นเรียนด้านล่าง",
        className: "ชื่อชั้นเรียน",
        selectGrade: "เลือกเกรด",
        grade: "เกรด",
        toast: {
          attention: "ความสนใจ",
          attentionDescription: "ต้องกรอกข้อมูลทุกช่อง!",
          successUpdate: "อัปเดตสำเร็จ",
          successUpdateDescription: "อัปเดตรายละเอียดชั้นเรียนเรียบร้อยแล้ว",
        },
        update: "อัปเดตชั้นเรียน",
        cancel: "ยกเลิก",
      },
    
      archieve: {
        title: "เก็บถาวรชั้นเรียน",
        descriptionBefore: "คุณต้องการเก็บถาวร ",
        descriptionAfter: " ชั้นเรียนหรือไม่?",
        archive: "เก็บถาวร",
        cancel: "ยกเลิก",
        toast: {
          successArchive: "เก็บถาวรชั้นเรียน",
          successArchiveDescription: "เก็บถาวรชั้นเรียนเรียบร้อยแล้ว!",
          errorArchive: "ข้อผิดพลาด",
          errorArchiveDescription: "เกิดข้อผิดพลาดขณะเก็บถาวรชั้นเรียน",
        },
      },
    
      delete: {
        title: "ลบชั้นเรียน",
        descriptionBefore: "คุณต้องการลบ ",
        descriptionAfter: " ชั้นเรียนหรือไม่?",
        delete: "ลบ",
        cancel: "ยกเลิก",
        toast: {
          successDelete: "ลบชั้นเรียนเรียบร้อยแล้ว",
          successDeleteDescription: "ลบชั้นเรียนเรียบร้อยแล้ว",
          errorDelete: "ข้อผิดพลาด",
          errorDeleteDescription: "เกิดข้อผิดพลาดขณะลบชั้นเรียน",
        },
      },
    },

    myStudent: {
      title: "นักเรียนของฉัน",
      name: "ชื่อ",
      email: "อีเมล",
      searchName: "ค้นหาชื่อ...",
      actions: "การดำเนินการ",
      progress: "ความคืบหน้า",
      enroll: "ลงทะเบียน",
      unEnroll: "ยกเลิกการลงทะเบียน",
      resetProgress: "รีเซ็ตความคืบหน้า",
      resetTitle: "รีเซ็ตความคืบหน้า XP ทั้งหมด",
      resetDescription: "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตความคืบหน้าทั้งหมด?",
      reset: "รีเซ็ต",
      cancelReset: "ยกเลิก",
    
      enrollPage: {
        title: "ชั้นเรียนที่ลงทะเบียนได้สำหรับ {studentName}",
        add: "เพิ่ม",
        search: "ค้นหา...",
        className: "ชื่อชั้นเรียน",
        enroll: "ลงทะเบียน",
        toast: {
          successEnrollment: "ลงทะเบียนสำเร็จ",
          successEnrollDescription: "นักเรียนได้ลงทะเบียนในชั้นเรียน",
          errorEnrollment: "การลงทะเบียนล้มเหลว",
          errorEnrollDescription: "นักเรียนไม่ได้ลงทะเบียนในชั้นเรียน",
        }
      }, 
      unEnrollPage: {
        title: "ยกเลิกการลงทะเบียนชั้นเรียนสำหรับ {studentName}",
        remove: "ลบ",
        search: "ค้นหา...",
        className: "ชื่อชั้นเรียน",
        unEnroll: "ยกเลิกการลงทะเบียน",
        toast: {
          successUnenrollment: "ลบสำเร็จ",
          successUnenrollDescription: "นักเรียนได้ถูกลบออกจากชั้นเรียน",
          errorUnenrollment: "การยกเลิกการลงทะเบียนล้มเหลว",
          errorUnenrollDescription: "นักเรียนไม่ได้ถูกลบออกจากชั้นเรียน",
        }
      },
    },

    classRoster: {
      title: "รายชื่อนักเรียนสำหรับห้องเรียน: {className}",
      description: "กรุณาเลือกชั้นเรียนจากชั้นเรียนของฉัน",
      name: "ชื่อ",
      lastActivity: "กิจกรรมล่าสุด",
      actions: "การดำเนินการ",
      search: "ค้นหาชื่อ...",
      noStudent: "ไม่มีนักเรียนในชั้นนี้",
      addStudentButton: "เพิ่มนักเรียนใหม่",
      toast: {
        successResetProgress: "รีเซ็ตความคืบหน้าสำเร็จ",
        successResetProgressDescription: "ความคืบหน้าทั้งหมดถูกรีเซ็ตแล้ว",
      },
    
      addNewStudent: {
        title: "เพิ่มนักเรียนใหม่ไปยัง {className}",
        description: "เพิ่มนักเรียนใหม่ในห้องเรียนโดยป้อนที่อยู่อีเมลของพวกเขา",
        email: "อีเมล: ",
        placeholder: "ป้อนที่อยู่อีเมล",
        addStudent: "เพิ่มนักเรียนใหม่",
        warning: "ในการเพิ่มนักเรียน กรุณากรอกข้อมูลที่จำเป็นข้างต้น",
        saveButton: "บันทึกและดำเนินการต่อ",
        toast: {
          successAddStudent: "เพิ่มนักเรียนแล้ว",
          successAddStudentDescription: "นักเรียนถูกเพิ่มในชั้นเรียนนี้เรียบร้อยแล้ว",
          errorAddStudent: "เพิ่มนักเรียนล้มเหลว",
          errorAddStudentDescription: "ไม่สามารถเพิ่มนักเรียนในชั้นเรียนนี้",
          emailNotFound: "ไม่พบอีเมล",
          emailNotFoundDescription: "ที่อยู่อีเมลนี้ไม่มีบัญชีที่เกี่ยวข้อง กรุณาตรวจสอบการสะกดหรือทดลองใช้อีเมลอื่น",
        }
      },
    },

    reports: {
      title: "รายงานชั้นเรียน: {className}",
      averageLevel: "ระดับเฉลี่ย:",
      name: "ชื่อ",
      xp: "XP",
      level: "ระดับ",
      search: "ค้นหาชื่อ...",
      lastActivity: "กิจกรรมล่าสุด",
      actions: "การดำเนินการ",
      detail: "รายละเอียด",
      viewDetails: "ดูรายละเอียด",
      noStudent: "ไม่มีนักเรียนในชั้นนี้",
      noStudentDescription: "กรุณาเลือกชั้นเรียนจากชั้นเรียนของฉัน",
    
      editStudent: {
        title: "แก้ไขรายละเอียดนักเรียน",
        description: "อัปเดตรายละเอียดนักเรียนด้านล่าง",
        placeholder: "ชื่อนักเรียน",
        update: "อัปเดตนักเรียน",
        cancel: "ยกเลิก",
        toast: {
          successUpdate: "อัปเดตสำเร็จ",
          successUpdateDescription: "อัปเดตข้อมูลนักเรียนสำเร็จ",
          attentionUpdate: "ความสนใจ",
          attentionUpdateDescription: "กรุณากรอกข้อมูล",
          errorUpdate: "อัปเดตล้มเหลว",
          errorUpdateDescription: "ไม่สามารถอัปเดตข้อมูลนักเรียน",
        }
      },
      removeStudent: {
        title: "ลบนักเรียน",
        descriptionBefore: "คุณต้องการลบ",
        descriptionAfter: "ออกจากชั้นเรียนนี้หรือไม่?",
        remove: "ลบ",
        cancel: "ยกเลิก",
        toast: {
          successRemove: "ลบนักเรียนสำเร็จ",
          successRemoveDescription: "ลบนักเรียนสำเร็จ",
          errorRemove: "ข้อผิดพลาด",
          errorRemoveDescription: "เกิดข้อผิดพลาดในการลบนักเรียนในชั้นเรียนนี้",
        }
      },
    },
    
    
    

    
  },
} as const;
