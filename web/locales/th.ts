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
<<<<<<< HEAD
=======
    // use this for article selection page
    types: {
      // article type
      fiction: "นิยาย",
      // fiction
      "Adventure": "ผจญภัย",
      "Horror": "สยองขวัญ",
      "Epic": "มหากาพย์",
      "Media": "สื่อ",
      "Romance": "โรแมนติก",
      "Classic Literature": "วรรณกรรมคลาสสิก",
      "Western": "ตะวันตก",
      "Drama": "บทละคร",
      "Fantasy": "แฟนตาซี",
      "Science Fiction": "นิยายเเนววิทยาศาสตร์",
      "Dystopian Fiction": "นิยายแนวดิสโทเปีย",
      "Mythology": "เทพนิยาย",
      "novel": "นิยาย",
      "Folklore": "คติชนวิทยา",
      "Mystery": "เรื่องลึกลับ",
      "Comedy": "เรื่องขบขัน",
      "Literary Fiction": "นิยายวรรณกรรม",
      "Family Drama": "ละครครอบครัว",
      // Adventure
      "Exploration": "การสำรวจ",
      "Animal Adventure": "การผจญภัยของสัตว์",
      "Treasure Hunt": "ล่าสมบัติ",
      "Historical Fiction": "นิยายอิงประวัติศาสตร์",
      "Historical fiction": "นิยายอิงประวัติศาสตร์",
      // Horror
      "Psychological Horror": "สยองขวัญแนวจิตวิทยา",
      "Gothic horror": "สยองขวัญเเนวกอธิค",
      "Supernatural": "เหนือธรรมชาติ",
      // media
      "World Literature": "วรรณคดีโลก",
      // romance
      "Young Adult": "คนหนุ่มสาว",
      "Contemporary Romance": "โรแมนติกร่วมสมัย",
      // Classic Literature
      "Romantic Fiction": "นิยายโรแมนติก",
      // western
      "Bounty Hunter": "นักล่าเงินรางวัล",
      // drama
      "Coming-of-Age": "เรื่องราวการเติบโต",
      // Historical fiction
      "Legendary": "ตำนาน",
      // fantasy
      "Time Travel": "การเดินทางข้ามเวลา",
      "Mythical Creatures": "สัตว์ในตำนาน",
      "Epic Fantasy": "มหากาพย์แฟนตาซี",
      "Urban Fantasy": "เมืองแฟนตาซี",
      "Magical Realism": "ความสมจริงที่มีมนต์ขลัง",
      "Supernatural Mystery": "สิ่งลี้ลับเหนือธรรมชาติ",
      // Science Fiction
      "Space Opera": "โอเปร่าอวกาศ",
      "Dystopian": "ดิสโทเปีย",
      "Time Travel Comedy": "เรื่องการเดินทางข้ามเวลาที่มีเนื้อหาตลก",
      // dystopian fiction
      "Resistance": "การต่อต้าน",
      // Mythology
      "Hindu Mythology": "ตำนานฮินดู",
      "Aztec Mythology": "ตำนานแอซเท็ก",
      "African Mythology": "ตำนานแอฟริกัน",
      "Andean Mythology": "ตำนานแอนเดียน",
      "Creation Myth": "ตำนานการสร้าง",
      "Greek Mythology": "ตำนานเทพเจ้ากรีก",
      // Folklore
      "Eastern European Folklore": "นิทานพื้นบ้านยุโรปตะวันออก",
      // Mystery
      "Detective Fiction": "นิยายสืบสวน",
      "Psychological Thriller": "ระทึกขวัญจิตวิทยา",
      // comedy
      "Superhero": "ซูเปอร์ฮีโร่",
      // Historical Fiction
      "Medieval Adventure": "การผจญภัยในยุคกลาง",
      "Harlem Renaissance": "ฮาเล็มเรอเนซองส์",
      "World War II Resistance": "การต่อต้านสงครามโลกครั้งที่สอง",
      // Literary Fiction
      "Existential Fiction": "นิยายที่มีอยู่",
      "Modernist Literature": "วรรณคดีสมัยใหม่",
      "Existentialism": "วิวัฒนาการตนเอง",
      // Drama
      "Domestic Life": "ชีวิตในครอบครัว",
      // novel
      "drama": "บทละคร",

      /* ------------------------------- */

      // article type non-fiction
      nonfiction: "สารคดี",
      // non-fiction
      "Entertainment": "ความบันเทิง",
      "Film": "ภาพยนตร์",
      "Psychology": "จิตวิทยา",
      "Social Issues": "ประเด็นทางสังคม",
      "Earth Science": "วิทยาศาสตร์โลก",
      "Science": "วิทยาศาสตร์",
      "Biology": "ชีววิทยา",
      "History": "ประวัติศาสตร์",
      "Paranormal": "นอกเหนือหลักธรรมชาติ",
      "Arts": "ศิลปะ",
      "Environmental Science": "วิทยาศาสตร์สิ่งแวดล้อม",
      "True Crime": "อาชญากรรมที่แท้จริง",
      "Technology": "เทคโนโลยี",
      "Education": "การศึกษา",
      "Sociology": "สังคมวิทยา",
      "Art and Technology": "ศิลปะและเทคโนโลยี",
      "Natural Science": "วิทยาศาสตร์ธรรมชาติ",
      "Biography": "ชีวประวัติ",
      "Business": "ธุรกิจ",
      "Sports": "กีฬา",
      "Nature": "ธรรมชาติ",
      "Self-help": "การช่วยเหลือตนเอง",
      "Travel Guide": "คู่มือการเดินทาง",
      "Memoir": "ความทรงจำ",
      "Health": "สุขภาพ",
      "Science and Technology": "วิทยาศาสตร์และเทคโนโลยี",
      "Religion": "ศาสนา",
      "Educational": "เกี่ยวกับการศึกษา",
      "Health and Wellness": "สุขภาพและความกินดีอยู่ดี",
      "Self-Help": "การช่วยเหลือตนเอง",
      "Natural Sciences": "วิทยาศาสตร์ธรรมชาติ",
      "Cultural Celebration": "การเฉลิมฉลองทางวัฒนธรรม",
      "Travel": "การท่องเที่ยว",
      "Visual Arts": "ทัศนศิลป์",
      "Music": "ดนตรี",
      "Cryptozoology": "สัตววิทยา",
      "Social Sciences": "สังคมศาสตร์",
      "Medical": "ทางการแพทย์",
      "Political Science": "รัฐศาสตร์",
      "Natural History": "ประวัติศาสตร์ธรรมชาติ",
      "Religion and Spirituality": "ศาสนาและจิตวิญญาณ",
      // Entertainment
      "Podcasts": "พอดแคสต์",
      "Film Industry": "อุตสาหกรรมภาพยนตร์",
      // Psychology
      "Music and Memory": "ดนตรีและความทรงจำ",
      "Music Therapy": "ดนตรีบำบัด",
      // Social Issues
      "Indigenous Rights": "สิทธิของชนพื้นเมือง",
      // Earth Science
      "Natural Disasters": "ภัยพิบัติทางธรรมชาติ",
      // Science
      "The Marvels of Earth's Magnetic Field": "ความมหัศจรรย์ของสนามแม่เหล็กโลก",
      "Renewable Energy": "พลังงานทดแทน",
      "Astrophysics": "ฟิสิกส์ดาราศาสตร์",
      "Geology": "ธรณีวิทยา",
      "Scientist": "นักวิทยาศาสตร์",
      "Animal Biology": "ชีววิทยาสัตว์",
      "Ecology": "นิเวศวิทยา",
      "Paleontology": "บรรพชีวินวิทยา",
      "Physics": "ฟิสิกส์",
      "Botany": "พฤกษศาสตร์",
      "Marine Biology": "ชีววิทยาทางทะเล",
      "Evolution": "วิวัฒนาการ",
      "Astronomy": "ดาราศาสตร์",
      "Space Exploration": "การสำรวจอวกาศ",
      "Meteorology": "อุตุนิยมวิทยา",
      // Biology
      "Animal Behavior": "พฤติกรรมของสัตว์",
      "Animals": "สัตว์",
      "Wildlife": "สัตว์ป่า",
      "Organismal Biology": "ชีววิทยาของสิ่งมีชีวิต",
      "Herpetology": "วิทยาสัตว์",
      "Aquatic Life": "สิ่งมีชีวิตในน้ำ",
      "Animal Adaptations": "การปรับตัวของสัตว์",    
      // History
      "Medieval History": "ประวัติศาสตร์ยุคกลาง",
      "Ancient Egypt": "อียิปต์โบราณ",
      "Invention and Technology": "การประดิษฐ์และเทคโนโลยี",
      "European History": "ประวัติศาสตร์ยุโรป",
      "World War II": "สงครามโลกครั้งที่สอง",
      "War": "สงคราม",
      "Military History": "ประวัติศาสตร์การทหาร",
      "Invention": "สิ่งประดิษฐ์",
      "Ancient Rome": "โรมโบราณ",
      "Ancient Civilization": "อารยธรรมโบราณ",
      "Ancient History": "ประวัติศาสตร์สมัยโบราณ",
      "Transportation and Communication": "การคมนาคมและการสื่อสาร",
      "Ancient Civilizations": "อารยธรรมโบราณ",
      "Islamic History": "ประวัติศาสตร์อิสลาม",
      "Modern History": "ประวัติศาสตร์สมัยใหม่",
      "Revolution": "การปฎิวัติ",
      // Paranormal
      "Haunted Locations": "สถานที่ผีสิง",
      // Arts
      "Art Techniques": "เทคนิคศิลปะ",
      "Comics and Graphic Novels": "การ์ตูนและนวนิยายกราฟฟิค",
      "Screenwriting": "การเขียนบทภาพยนตร์",
      // Environmental Science
      "Marine Pollution": "มลภาวะทางทะเล",
      "Land Degradation": "ความเสื่อมโทรมของที่ดิน",

      // True Crime
      "Serial Killers": "ฆาตกรต่อเนื่อง",
      // Technology
      "Wearable Technology": "เทคโนโลยีสวมใส่ได้",
      "History and Evolution": "ประวัติศาสตร์และวิวัฒนาการ",
      "Mobile Technology": "เทคโนโลยีมือถือ",
      "Internet": "อินเทอร์เน็ต",
      "History and Impact": "ประวัติศาสตร์และผลกระทบ",
      // Education
      "STEAM Education": "การศึกษาเรื่องไอน้ำ",
      "Technology in Education": "เทคโนโลยีในการศึกษา",
      "Diversity and Inclusion": "ความหลากหลายและการไม่แบ่งแยก",
      // Sociology
      "Global Collaboration": "ความร่วมมือระดับโลก",
      // Art and Technology
      "Digital Art": "งานศิลปะดิจิทัล",
      // Natural Science
      "Aquatic Biology": "ชีววิทยาทางน้ำ",
      "Wildlife Biology": "ชีววิทยาสัตว์ป่า",
      // Biography
      "Inventors": "นักประดิษฐ์",
      "Historical Biography": "ชีวประวัติทางประวัติศาสตร์",
      "Art History": "ประวัติศาสตร์ศิลปะ",
      "Civil Rights Movement": "ขบวนการสิทธิพลเมือง",
      "Philosophy": "ปรัชญา",
      // Business
      "Art Entrepreneurship": "ผู้ประกอบการด้านศิลปะ",
      // sports
      "Sports Media": "สื่อกีฬา",
      "Inspirational": "สร้างแรงบันดาลใจ",
      "Media Coverage": "การรายงานข่าวของสื่อ",
      "Women in Sports": "กีฬาของผู้หญิง",
      // nature
      "Marine Life": "ชีวิตทางทะเล",
      "Bird Watching": "การดูนก",
      "Wildlife Conservation": "การอนุรักษ์สัตว์ป่า",
      // Self-help
      "Relationships": "ความสัมพันธ์",
      "Personal Development": "การพัฒนาตนเอง",
      "Communication Skills": "ความสามารถในการสื่อสาร",
      // Travel Guide
      "City Guide": "คู่มือเเนะนำเมือง",
      // Memoir
      "Medical Memoir": "ความทรงจำทางการแพทย์",
      // Horror
      "Legends": "ตำนาน",
      // Health
      "Medical Profession": "วิชาชีพแพทย์",
      "Public Health": "สาธารณสุข",
      "Epidemiology": "ระบาดวิทยา",
      // Science and Technology
      "Home Appliances": "เครื่องใช้ไฟฟ้าภายในบ้าน",
      "Music Technology": "เทคโนโลยีดนตรี",
      "History and Innovation": "ประวัติศาสตร์และนวัตกรรม",
      // Religion
      "Judaism": "ศาสนายิว",
      // Educational
      "Media Literacy": "รู้เท่าทันสื่อ", 
      // Health and Wellness
      "Physical Fitness": "สมรรถภาพทางกาย",
      "Alternative Medicine": "การแพทย์ทางเลือก",    
      "Fitness": "ฟิตเนส",
      // Self-help
      "Time Management": "การจัดการเวลา",
      // Natural Sciences
      // Cultural Celebration 
      "Indigenous Festivals": "เทศกาลพื้นเมือง",
      "Traditional Festival": "เทศกาลประเพณี",
      // Travel
      "Travel Guides": "คู่มือการเดินทาง",
      "Cultural Festival": "เทศกาลวัฒนธรรม", 
      // Visual Arts
      "Film and Fine Art": "ภาพยนตร์และวิจิตรศิลป์",
      // Music
      "Biographies": "ชีวประวัติ",    
      "Social Issues in Music": "ประเด็นสังคมทางดนตรี",
      "History of Music Innovation": "ประวัติความเป็นมาของนวัตกรรมทางดนตรี",
      "Musical Collaboration": "ความร่วมมือทางดนตรี",
      "Exploration of Music Genres": "การสำรวจแนวเพลง", 
      "Musical Collaborations": "ความร่วมมือทางดนตรี",
      "Music History": "ประวัติศาสตร์ดนตรี",
      // "Cryptozoology   
      "Legendary Creatures": "สัตว์ในตำนาน",
      "Cryptids": "สัตว์ประหลาด",
      "Cryptids and Mythical Beasts": "สัตว์ประหลาดและสัตว์ในตำนาน",
      // Mythology
      "Australian Aboriginal Mythology": "ตำนานอะบอริจินของออสเตรเลีย", 
      "Australian Aboriginal": "ชาวอะบอริจินของออสเตรเลีย",
      // Social Sciences
      // Medical
      "Cardiology": "โรคหัวใจ",    
      // Political Science
      "Global Governance": "ธรรมาภิบาลระดับสากล",
      // Natural History
      "Birds": "นก",
      "Extinction and Conservation": "การสูญพันธุ์และการอนุรักษ์",
      "Evolutionary Biology": "ชีววิทยาเชิงวิวัฒนาการ", 
      "Insects": "แมลง",
      "Ornithology": "ปักษีวิทยา",    
      "Arctic Wildlife": "สัตว์ป่าอาร์กติก",
      "Mammalogy": "สัตว์เลี้ยงลูกด้วยนมวิทยา",
      "Prehistoric Animals": "สัตว์ยุคก่อนประวัติศาสตร์",
      // Religion and Spirituality
      "Indigenous Beliefs": "ความเชื่อพื้นเมือง", 
    },

>>>>>>> 2b400a1 (rebase commit)
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
  },
} as const;
