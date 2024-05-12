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
