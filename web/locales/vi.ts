export default {
  pages: {
    indexPage: {
      description:
        "Ứng dụng đọc sách đa dạng tích hợp trí tuệ nhân tạo. Phiên bản beta và đang trong quá trình thử nghiệm.",
      getStartedButton: "Bắt đầu",
    },
    loginPage: {
      loginDescription: "Đăng nhập vào tài khoản của bạn",
      backButton: "Quay lại",
    },
    student: {
      readPage: {
        // Headings
        articleSelection: "Chọn bài viết",
        // Trang nextquiz/[articleId]
        article: {
          articleNotFound: "Không tìm thấy bài viết",
          articleInsufficientLevel:
            "Bạn không thể đọc bài viết này vì trình độ đọc của bạn chưa đủ.",
          // Headings
          readBefore: "Bạn đã đọc bài viết này trước đây",
          readBeforeDescription:
            "Bạn có thể thử đọc và luyện tập lại để cải thiện kỹ năng đọc của mình. Đây là kết quả đọc trước đó của bạn.",
          // Thống kê
          status: "Trạng thái",
          statusText: {
            completed: "Hoàn thành",
            uncompleted: "Chưa hoàn thành",
          },
          statusDescription: "Cập nhật lần cuối vào {date}",
          score: "Điểm bài kiểm tra",
          scoreText: "{score}",
          scoreDescription: "từ {total} câu hỏi",
          rated: "Được đánh giá",
          ratedText: "{rated} đánh giá",
          ratedDescription: "Bạn đã đánh giá bài viết này",
          timeSpend: "Thời gian đã dùng",
          timeSpendText: "{time}",
          timeSpendDescription: "trong {total} câu hỏi",
          scoreSuffix: {
            point: "điểm",
            points: "điểm",
          },
          secondSuffix: {
            second: "giây",
            seconds: "giây",
          },
        },
      },
      historyPage: {
        // Headings
        reminderToReread: "Lời nhắc đọc lại",
        articleRecords: "Hồ sơ bài viết",
        // Descriptions
        reminderToRereadDescription:
          "Bạn có thể muốn đọc lại một trong những bài viết này để xem liệu bạn đã cải thiện chưa.",
        articleRecordsDescription: "Hồ sơ đọc của bạn sẽ được hiển thị ở đây.",
      },
      practicePage: {
        // Headings
        flashcard: "Thẻ học",
        manage: "quản lý",
        orderSentences: "Sắp xếp câu",
        clozeTest: "Bài kiểm tra lỗ hổng",
        orderWords: "Sắp xếp từ",
        matching: "Kết hợp",
        // Descriptions
        flashcardDescription:
          "Bạn có thể luyện tập kỹ năng đọc của mình với thẻ học. Và các câu đoạn đã lưu của bạn sẽ được hiển thị ở đây.",
        savedSentences: "Câu đoạn đã lưu",
        noSavedSentences: "Bạn chưa lưu câu đoạn nào.",
        savedSentencesDescription: "Bạn đã lưu {total} câu đoạn.",
        added: "Thêm vào {date}",
        deleteButton: "Xóa",
        neverPracticeButton: "Không cần luyện tập câu này nữa.",
        toast: {
          success: "Thành công",
          successDescription: "Xóa câu đoạn đã lưu thành công",
          error: "Lỗi",
          errorDescription:
            "Có lỗi xảy ra khi xóa câu đoạn đã lưu. Vui lòng thử lại sau.",
        },
        flashcardPractice: {
          buttonVeryHard: "lại",
          buttonHard: "Khó",
          buttonGood: "Tốt",
          buttonEasy: "Dễ",
          flipCard: "Lật thẻ",
          nextButton: "Tiếp theo",
          yourXp: "Bạn đã nhận được {xp} XP cho hoạt động này",
        },
        orderSentencesPractice: {
          orderSentences: "Sắp xếp câu",
          orderSentencesDescription:
            "Đây là một số câu từ một đoạn văn bạn đã đọc. Hãy xếp các câu theo trật tự có ý nghĩa với bạn. Nếu trật tự giống như trong đoạn văn, bạn sẽ nhận được 5 XP.",
          saveOrder: "Lưu & Tiếp tục sau",
          errorOrder: "Vui lòng sắp xếp theo thứ tự chính xác",
        },
        clozeTestPractice: {
          clozeTest: "Bài kiểm tra lỗ hổng",
          clozeTestDescription:
            "Đây là một số câu từ một đoạn văn bạn đã đọc. Hãy điền từ còn thiếu vào để hoàn thành chúng. Nếu bạn trả lời đúng, bạn sẽ nhận được 2 XP.",
          saveOrder: "Lưu & Tiếp tục sau",
          errorOrder: "Vui lòng sắp xếp theo thứ tự chính xác",
        },
        orderWordsPractice: {
          orderWords: "Sắp xếp từ",
          orderWordsDescription:
            "Đây là một câu từ một đoạn văn bạn đã đọc. Hãy sắp xếp các từ theo trật tự có ý nghĩa đối với bạn. Nếu trật tự giống như trong đoạn văn, bạn sẽ nhận được 5 điểm kinh nghiệm.",
          saveOrder: "Tiếp tục",
          errorOrder: "Vui lòng sắp xếp đúng",
          submitArticle: "Kiểm tra câu trả lời của bạn",
          nextPassage: "Đoạn tiếp theo",
          tryToSortThisSentence: "Hãy sắp xếp câu này.",
        },
        matchingPractice: {
          matching: "Ghép cặp",
          matchingDescription:
            "Hãy ghép câu với bản dịch của nó. Nếu bạn ghép đúng tất cả các câu, bạn sẽ nhận được 5 XP.",
          saveOrder: "Lưu & Tiếp tục sau",
          errorOrder: "Vui lòng sắp xếp đúng",
          submitArticle: "Kiểm tra câu trả lời của bạn",
          nextPassage: "Đoạn tiếp theo",
          minSentencesAlert: "Bạn cần ít nhất năm câu đã lưu để tham gia hoạt động này.",
        },
      },
    },
  },
  components: {
    mainNav: {
      home: "Trang chủ",
      about: "Về chúng tôi",
      contact: "Liên hệ",
      authors: "tác giả",
    },
    userAccountNav: {
      level: "Trình độ {level}",
      settings: "Cài đặt",
      signOut: "Đăng xuất",
    },
    themeSwitcher: {
      dark: "Tối",
      light: "Sáng",
      system: "Hệ thống",
    },
    localeSwitcher: {
      en: "English",
      th: "ไทย",
      cn: "简体中文",
      tw: "繁體字",
      vi: "Tiếng Việt",
    },
    sidebarNav: {
      read: "Đọc",
      history: "Lịch sử",
      sentences: "Câu",
      reports: "Báo cáo",
    },
    sidebarTeacherNav: {
      myClasses: "Lớp học của tôi",
      myStudents: "học sinh của tôi",
      classRoster: "Danh sách lớp",
      reports: "báo cáo",
    },
    articleRecordsTable: {
      title: "Tiêu đề",
      date: "Ngày",
      rated: "Đánh giá",
      search: "Tìm kiếm tiêu đề...",
      previous: "trước",
      next: "sau",
      select: "{selected} trong {total} đã chọn",
    },
    firstRunLevelTest: {
      heading: "Hãy bắt đầu bằng cách kiểm tra kỹ năng của bạn!",
      description: "Chọn câu trả lời đúng để đánh giá trình độ đọc của bạn.",
      nextButton: "Tiếp theo",
      section: "Phần {currentSectionIndex}",
      toast: {
        successUpdate: "Thành công!",
        successUpdateDescription:
          "Kinh nghiệm và cấp độ của bạn đã được cập nhật.",
        attention: "chú ý",
        attentionDescription: "Xin vui lòng trả lời tất cả các câu hỏi!",
        errorTitle: "Đã xảy ra lỗi.",
        errorDescription:
          "Kinh nghiệm và cấp độ của bạn chưa được cập nhật. Vui lòng thử lại.",
      },
      congratulations: "Xin chúc mừng!",
      congratulationsDescription: "Việc đánh giá đã hoàn tất.",
      yourScore: "Điểm của bạn: {xp}",
      yourCefrLevel: "Cấp độ CEFR của bạn: {cefrLevel}",
      yourRaLevel: "Cấp RA của bạn: {raLevel}",
      getStartedButton: "Bắt đầu",
    },
    progressBarXp: {
      xp: "kinh nghiệm: ",
      level: "mức độ {level}",
      congratulations: "Xin chúc mừng!",
      upLevel: "Bạn đã nhận được một cấp độ mới!",
      close: "đóng",
    },
    // Sử dụng cho trang chọn bài viết
    // Đây là thành phần chọn
    select: {
      articleChoose: "Hãy chọn bài viết {article} bạn muốn đọc",
      articleChooseDescription:
        "Trình độ của bạn là {level} và đây là các bài viết {article} bạn có thể chọn.",
    },
    // Sử dụng cho trang chọn bài viết
    article: {
      type: "Thể loại bài viết",
      genre: "Thể loại bài viết",
      subGenre: "Thể loại phụ bài viết",
      article: "Bài viết",
    },
<<<<<<< HEAD
=======
    // use this for article selection page
    types: {
     // article type
     fiction: "viễn tưởng",
     // fiction
     "Adventure": "Phiêu lưu",
     "Horror": "Kinh dị",
     "Epic": "Hùng biện",
     "Media": "Truyền thông",
     "Romance": "Lãng mạn",
     "Classic Literature": "Văn học cổ điển",
     "Western": "Miền Tây",
     "Drama": "Kịch",
     "Fantasy": "Tưởng tượng",
     "Science Fiction": "Khoa học viễn tưởng",
     "Dystopian Fiction": "tiểu thuyết đen tối",
     "Mythology": "Thần thoại",
     "novel": "tiểu thuyết",
     "Folklore": "Văn hóa dân gian",
     "Mystery": "Bí ẩn",
     "Comedy": "Hài",
     "Literary Fiction": "Văn học",
     "Family Drama": "Kịch gia đình",
     // Adventure
     "Exploration": "Khám phá",
     "Animal Adventure": "Phiêu lưu cùng động vật",
     "Treasure Hunt": "Săn kho báu",
     "Historical Fiction": "Tiểu thuyết lịch sử",
     "Historical fiction": "Tiểu thuyết lịch sử",
     // Horror
     "Psychological Horror": "Kinh dị tâm lý",
     "Gothic horror": "kinh dị Gothic",
     "Supernatural": "Siêu nhiên",
     // media
     "World Literature": "Văn học thế giới",
     // romance
     "Young Adult": "Người trẻ tuổi",
     "Contemporary Romance": "Lãng mạn đương đại",
     // Classic Literature
     "Romantic Fiction": "Tiểu thuyết lãng mạn",
     // western
     "Bounty Hunter": "Thợ săn tiền thưởng",
     // drama
     "Coming-of-Age": "Chuyện lớn lên",
     // Historical fiction
     "Legendary": "Huyền thoại",
     // fantasy
     "Time Travel": "Du hành thời gian",
     "Mythical Creatures": "Sinh vật huyền bí",
     "Epic Fantasy": "Kỳ thư huyền bí",
     "Urban Fantasy": "Kỳ thư đô thị",
     "Magical Realism": "Hiện thực ma thuật",
     "Supernatural Mystery": "Bí ẩn siêu nhiên",
     // Science Fiction
     "Space Opera": "Opera không gian",
     "Dystopian": "Phản địa đàng",
     "Time Travel Comedy": "Hài hước về du hành thời gian",
     // dystopian fiction
     "Resistance": "Sự kháng cự",
     // Mythology
     "Hindu Mythology": "Thần thoại Hindu",
     "Aztec Mythology": "Thần thoại Aztec",
     "African Mythology": "Thần thoại châu Phi",
     "Andean Mythology": "Thần thoại Andean",
     "Creation Myth": "Thần thoại sáng tạo",
     "Greek Mythology": "Thần thoại Hy Lạp",
     // Folklore
     "Eastern European Folklore": "Văn hóa dân gian Đông Âu",
     // Mystery
     "Detective Fiction": "Tiểu thuyết trinh thám",
     "Psychological Thriller": "Phim kinh dị tâm lý",
     // comedy
     "Superhero": "Siêu anh hùng",
     // Historical Fiction
     "Medieval Adventure": "Phiêu lưu thời Trung cổ",
     "Harlem Renaissance": "Phục hưng Harlem",
     "World War II Resistance": "Kháng chiến Thế chiến II",
     // Literary Fiction
     "Existential Fiction": "Văn học tồn tại",
     "Modernist Literature": "Văn học hiện đại",
     "Existentialism": "Chủ nghĩa tồn tại",
     // Drama
     "Domestic Life": "Cuộc sống gia đình",
     // novel
     "drama": "kịch",

     /* ------------------------------- */

     // article type non-fiction
     nonfiction: "sách phi hư cấu",
     // non-fiction
     "Entertainment": "Giải trí",
     "Film": "Phim ảnh",
     "Psychology": "Tâm lý học",
     "Social Issues": "Vấn đề Xã hội",
     "Earth Science": "Khoa học Trái đất",
     "Science": "Khoa học",
     "Biology": "Sinh học",
     "History": "Lịch sử",
     "Paranormal": "Siêu nhiên",
     "Arts": "Nghệ thuật",
     "Environmental Science": "Khoa học Môi trường",
     "True Crime": "Tội phạm có thật",
     "Technology": "Công nghệ",
     "Education": "Giáo dục",
     "Sociology": "Xã hội học",
     "Art and Technology": "Nghệ thuật và Công nghệ",
     "Natural Science": "Khoa học Tự nhiên",
     "Biography": "Tiểu sử",
     "Business": "Kinh doanh",
     "Sports": "Thể thao",
     "Nature": "Tự nhiên",
     "Self-help": "Tự giúp bản thân",
     "Travel Guide": "Hướng dẫn du lịch",
     "Memoir": "Hồi ký",
     "Health": "Sức khỏe",
     "Science and Technology": "Khoa học và Công nghệ",
     "Religion": "Tôn giáo",
     "Educational": "Giáo dục",
     "Health and Wellness": "Sức khỏe và Sự thịnh vượng",
     "Self-Help": "Tự giúp bản thân",
     "Natural Sciences": "Khoa học tự nhiên",
     "Cultural Celebration": "Lễ hội văn hóa",
     "Travel": "Du lịch",
     "Visual Arts": "Nghệ thuật hình ảnh",
     "Music": "Âm nhạc",
     "Cryptozoology": "Khoa học về động vật huyền bí",
     "Social Sciences": "Khoa học xã hội",
     "Medical": "Thuộc về y học",
     "Political Science": "Khoa học chính trị",
     "Natural History": "Lịch sử tự nhiên",
     "Religion and Spirituality": "Tôn giáo và Tâm linh",
     // Entertainment
     "Podcasts": "Podcasts",
     "Film Industry": "Ngành công nghiệp phim ảnh",
     // Psychology
     "Music and Memory": "Âm nhạc và Trí nhớ",
     "Music Therapy": "Điều trị Âm nhạc",
     // Social Issues
     "Indigenous Rights": "Quyền của Các dân tộc bản địa",
     // Earth Science
     "Natural Disasters": "Thảm họa Tự nhiên",
     // Science
     "The Marvels of Earth's Magnetic Field": "Những kỳ quan của Trường từ Trái đất",
     "Renewable Energy": "Năng lượng tái tạo",
     "Astrophysics": "Vật lý thiên văn",
     "Geology": "Địa chất học",
     "Scientist": "Nhà khoa học",
     "Animal Biology": "Sinh học Động vật",
     "Ecology": "Hệ sinh thái học",
     "Paleontology": "Cổ sinh vật học",
     "Physics": "Vật lý",
     "Botany": "Thực vật học",
     "Marine Biology": "Sinh học Biển",
     "Evolution": "Tiến hóa",
     "Astronomy": "Thiên văn học",
     "Space Exploration": "Khám phá không gian",
     "Meteorology": "Khí tượng học",
     // Biology
     "Animal Behavior": "Hành vi Động vật",
     "Animals": "Động vật",
     "Wildlife": "Động vật hoang dã",
     "Organismal Biology": "Sinh học Cơ thể",
     "Herpetology": "Bò sát học",
     "Aquatic Life": "Đời sống Dưới nước",
     "Animal Adaptations": "Sự thích nghi của Động vật",    
     // History
     "Medieval History": "Lịch sử Trung cổ",
     "Ancient Egypt": "Ai Cập cổ đại",
     "Invention and Technology": "Sáng chế và Công nghệ",
     "European History": "Lịch sử Châu Âu",
     "World War II": "Thế chiến II",
     "War": "Chiến tranh",
     "Military History": "Lịch sử Quân sự",
     "Invention": "Sáng chế",
     "Ancient Rome": "La Mã cổ đại",
     "Ancient Civilization": "Nền văn minh cổ đại",
     "Ancient History": "Lịch sử cổ đại",
     "Transportation and Communication": "Giao thông và Truyền thông",
     "Ancient Civilizations": "Các nền văn minh cổ đại",
     "Islamic History": "Lịch sử Hồi giáo",
     "Modern History": "Lịch sử Hiện đại",
     "Revolution": "Cách mạng",
     // Paranormal
     "Haunted Locations": "Địa điểm ma ám",
     // Arts
     "Art Techniques": "Kỹ thuật Nghệ thuật",
     "Comics and Graphic Novels": "Truyện tranh và Tiểu thuyết đồ họa",
     "Screenwriting": "Viết kịch bản",
     // Environmental Science
     "Marine Pollution": "Ô nhiễm biển",
     "Land Degradation": "Suy thoái đất đai",
     // True Crime
     "Serial Killers": "Sát nhân hàng loạt",
     // Technology
     "Wearable Technology": "Công nghệ có thể mặc",
     "History and Evolution": "Lịch sử và Tiến hóa",
     "Mobile Technology": "Công nghệ di động",
     "Internet": "Internet",
     "History and Impact": "Lịch sử và Tác động",
     // Education
     "STEAM Education": "Giáo dục STEAM",
     "Technology in Education": "Công nghệ trong Giáo dục",
     "Diversity and Inclusion": "Đa dạng và Sự kết hợp",
     // Sociology
     "Global Collaboration": "Hợp tác Toàn cầu",
     // Art and Technology
     "Digital Art": "Nghệ thuật số",
     // Natural Science
     "Aquatic Biology": "Sinh học Động vật Dưới nước",
     "Wildlife Biology": "Sinh học Động vật hoang dã",
     // Biography
     "Inventors": "Nhà phát minh",
     "Historical": "Lịch sử",
     "Art History": "Lịch sử Nghệ thuật",
     "Civil Rights Movement": "Phong trào Dân quyền",
     "Philosophy": "Triết học",
     // Business
     "Art Entrepreneurship": "Doanh nhân Nghệ thuật",
     // sports
     "Sports Media": "Truyền thông Thể thao",
     "Inspirational": "truyền cảm hứng",
     "Media Coverage": "Phương tiện Truyền thông",
     "Women in Sports": "Phụ nữ trong Thể thao",
     // nature
     "Marine Life": "Đời sống Dưới biển",
     "Bird Watching": "Quan sát Chim",
     "Wildlife Conservation": "Bảo tồn Động vật hoang dã",
     // Self-help
     "Relationships": "Mối quan hệ",
     "Personal Development": "Phát triển cá nhân",
     "Communication Skills": "Kỹ năng Giao tiếp",
     // Travel Guide
     "City Guide": "Hướng dẫn Thành phố",
     // Memoir
     "Medical Memoir": "Hồi ký Y học",
     // Horror
     "Legends": "Huyền thoại",
     // Health
     "Medical Profession": "Ngành Y",
     "Public Health": "Y tế Công cộng",
     "Epidemiology": "Dịch tễ học",
     // Science and Technology
     "Home Appliances": "Thiết bị gia dụng",
     "Music Technology": "Công nghệ âm nhạc",
     "History and Innovation": "Lịch sử và Đổi mới",
     // Religion
     "Judaism": "Đạo Do thái",
     // Educational
     "Media Literacy": "Kiến thức truyền thông", 
     // Health and Wellness
     "Physical Fitness": "Sức khỏe Thể chất",
     "Alternative Medicine": "Y học Thay thế",    
     "Fitness": "Thể dục",
     // Self-help
     "Time Management": "Quản lý thời gian",
     // Natural Sciences
     // Cultural Celebration 
     "Indigenous Festivals": "Lễ hội Dân tộc bản địa",
     "Traditional Festival": "Lễ hội Truyền thống",
     // Travel
     "Travel Guides": "Hướng dẫn Du lịch",
     "Cultural Festival": "Lễ hội Văn hóa", 
     // Visual Arts
     "Film and Fine Art": "Phim và Nghệ thuật Tinh tế",
     // Music
     "Biographies": "Tiểu sử",    
     "Social Issues in Music": "Vấn đề Xã hội trong Âm nhạc",
     "History of Music Innovation": "Lịch sử Đổi mới Âm nhạc",
     "Musical Collaboration": "Sự hợp tác âm nhạc",
     "Exploration of Music Genres": "Khám phá Thể loại Âm nhạc", 
     "Musical Collaborations": "Sự hợp tác âm nhạc",
     "Music History": "Lịch sử Âm nhạc",
     // "Cryptozoology   
     "Legendary Creatures": "Sinh vật Huyền thoại",
     "Cryptids": "Cryptids",
     "Cryptids and Mythical Beasts": "Cryptids và Sinh vật Thần thoại",
     // Mythology
     "Australian Aboriginal Mythology": "Thần thoại của Người Aboriginal Úc", 
     "Australian Aboriginal": "Người Aboriginal Úc",
     // Social Sciences
     // Medical
     "Cardiology": "Tim mạch",    
     // Political Science
     "Global Governance": "Quản trị Toàn cầu",
     // Natural History
     "Birds": "Chim",
     "Extinction and Conservation": "Tuyệt chủng và Bảo tồn",
     "Evolutionary Biology": "Sinh học Tiến hóa", 
     "Insects": "Côn trùng",
     "Ornithology": "Ornithology",    
     "Arctic Wildlife": "Động vật hoang dã Bắc cực",
     "Mammalogy": "Sinh học Động vật có vú",
     "Prehistoric Animals": "Động vật tiền sử",
     // Religion and Spirituality
     "Indigenous Beliefs": "Niềm tin của Các dân tộc bản địa", 
    },

>>>>>>> 2b400a1 (rebase commit)
    articleCard: {
      raLevel: "Trình độ đọc là {raLevel}",
      cefrLevel: "Trình độ CEFR là {cefrLevel}",
      articleCardDescription:
        "Bài viết liên quan đến chủ đề {topic}, thuộc thể loại {genre}.",
    },
    articleContent: {
      voiceAssistant: "Trợ lý giọng nói",
      soundButton: {
        play: "Phát âm thanh",
        pause: "Tạm dừng âm thanh",
      },
      // button translate
      translateฺButton: {
        open: "Dịch",
        close: "Đóng cửa sổ dịch",
      },
    },
    mcq: {
      // Headings
      quiz: "Bài kiểm tra",
      reQuiz: "Làm lại bài kiểm tra",
      // Descriptions
      quizDescription:
        "Bắt đầu bài kiểm tra để kiểm tra kiến thức của bạn. Và xem bài viết này có dễ không.",
      reQuizDescription:
        "Bạn đã hoàn thành bài kiểm tra này trước đây. Bạn có thể làm lại để cải thiện điểm số của mình.",
      startButton: "Bắt đầu bài kiểm tra",
      retakeButton: "Làm lại bài kiểm tra",
      // Thẻ kiểm tra trắc nghiệm
      elapsedTime: "{time} giây đã trôi qua",
      questionHeading: "Câu hỏi {number} trong tổng số {total}",
      nextQuestionButton: "Câu hỏi tiếp theo",
      toast: {
        correct: "Đúng",
        correctDescription: "Bạn đã trả lời đúng!",
        incorrect: "Sai",
        incorrectDescription: "Bạn đã trả lời sai!",
        quizCompleted: "Hoàn thành bài kiểm tra",
        quizCompletedDescription: "Bạn đã hoàn thành bài kiểm tra",
        error: "Lỗi",
        errorDescription:
          "Có lỗi xảy ra khi gửi câu trả lời của bạn. Vui lòng thử lại sau.",
      },
    },
    rate: {
      title: "Đánh giá bài viết này",
      content: "Bạn đánh giá chất lượng của bài viết này như thế nào?",
      description:
        "Điểm đánh giá này được sử dụng để tính trình độ mới của bạn.",
      newLevel: "Trình độ mới của bạn là {level}",
      submitButton: "Gửi",
      backToHomeButton: "Trở về Trang chủ",
      nextQuizButton: "Bài kiểm tra tiếp theo",
      toast: {
        success: "Thành công",
        successDescription: "Trình độ mới của bạn là {level}.",
      },
    },
    audioButton: {
      play: "Phát âm thanh",
      pause: "Tạm dừng âm thanh",
    },
    menu: "Menu",
    loginButton: "Đăng nhập",
  },
} as const;
