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
    teacher: {
      studentProgressPage: {
        activity: "Hoạt Động",
        level: "Cấp Độ",
        levelDescription: "Cấp độ hiện tại của bạn là {level}",
        progressOf: "Tiến Độ Của {nameOfStudent}",
        noUserProgress: "Không có tiến độ người dùng do học sinh chưa từng đọc bài viết hoặc hoạt động khác.",
      },
    }
    
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
      passages: "Những đoạn văn",
      assignments: "Bài tập",
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

    passages: {
      heading: "Đoạn văn",
      type: "Loại",
      fiction: "Tiểu thuyết",
      nonFiction: "Phi hư cấu",
      topic: "Chủ đề",
      selectGenre: "Chọn thể loại",
      selectSubGenre: "Chọn thể loại con",
      level: "Cấp độ",
    },

    myClasses: {
      title: "Lớp Học Của Tôi",
      search: "Tìm kiếm tên lớp...",
      className: "Tên Lớp",
      classCode: "Mã Lớp",
      studentCount: "Số Lượng Học Sinh",
      actions: "Hành Động",
      detail: "Chi Tiết",
      roster: "Danh Sách",
      reports: "Báo Cáo",
    
      createNewClass: {
        button: "Tạo Lớp Học Mới",
        title: "Tạo lớp học mới",
        description: "Điền thông tin để tạo lớp học mới",
        className: "Tên Lớp",
        selectGrade: "Chọn Khối",
        grade: "Khối",
        create: "Tạo Lớp",
        cancel: "Hủy",
        toast: {
          attention: "Chú Ý",
          attentionDescription: "Tất cả các trường phải được điền!",
          successCreate: "Thành Công",
          successDescription: "Tạo lớp học thành công",
        },
      },
    
      edit: {
        title: "Chỉnh Sửa Chi Tiết Lớp",
        description: "Cập nhật chi tiết lớp học dưới đây",
        className: "Tên Lớp",
        selectGrade: "Chọn Khối",
        grade: "Khối",
        toast: {
          attention: "Chú Ý",
          attentionDescription: "Tất cả các trường phải được điền!",
          successUpdate: "Cập Nhật Thành Công",
          successUpdateDescription: "Cập nhật lớp học thành công",
        },
        update: "Cập Nhật Lớp",
        cancel: "Hủy",
      },
    
      archieve: {
        title: "Lưu Trữ Lớp Học",
        descriptionBefore: "Bạn có muốn lưu trữ lớp ",
        descriptionAfter: " không?",
        archive: "Lưu Trữ",
        cancel: "Hủy",
        toast: {
          successArchive: "Lớp học đã được lưu trữ",
          successArchiveDescription: "Lớp học đã được lưu trữ thành công!",
          errorArchive: "Lỗi",
          errorArchiveDescription: "Đã xảy ra lỗi khi lưu trữ lớp học",
        },
      },
    
      delete: {
        title: "Xóa Lớp Học",
        descriptionBefore: "Bạn có muốn xóa lớp ",
        descriptionAfter: " không?",
        delete: "Xóa",
        cancel: "Hủy",
        toast: {
          successDelete: "Lớp học đã được xóa",
          successDeleteDescription: "Lớp học đã được xóa thành công",
          errorDelete: "Lỗi",
          errorDeleteDescription: "Đã xảy ra lỗi khi xóa lớp học",
        },
      },
    },

    myStudent: {
      title: "Học Sinh Của Tôi",
      name: "Tên",
      email: "Email",
      searchName: "Tìm kiếm tên...",
      actions: "Hành Động",
      progress: "Tiến Trình",
      enroll: "Ghi Danh",
      unEnroll: "Hủy Ghi Danh",
      resetProgress: "Đặt Lại Tiến Trình",
      resetTitle: "Đặt lại tất cả tiến trình XP",
      resetDescription: "Bạn có chắc chắn muốn đặt lại tất cả tiến trình không?",
      reset: "Đặt Lại",
      cancelReset: "Hủy",
    
      enrollPage: {
        title: "Lớp học có sẵn cho {studentName} ghi danh",
        add: "Thêm",
        search: "Tìm kiếm...",
        className: "Tên Lớp",
        enroll: "Ghi Danh",
        toast: {
          successEnrollment: "Ghi danh thành công",
          successEnrollDescription: "Học sinh đã được ghi danh vào lớp",
          errorEnrollment: "Ghi danh thất bại",
          errorEnrollDescription: "Học sinh chưa được ghi danh vào lớp",
        }
      }, 
      unEnrollPage: {
        title: "Hủy ghi danh lớp học cho {studentName}",
        remove: "Xóa",
        search: "Tìm kiếm...",
        className: "Tên Lớp",
        unEnroll: "Hủy Ghi Danh",
        toast: {
          successUnenrollment: "Hủy ghi danh thành công",
          successUnenrollDescription: "Học sinh đã được hủy ghi danh khỏi lớp",
          errorUnenrollment: "Hủy ghi danh thất bại",
          errorUnenrollDescription: "Học sinh chưa được hủy ghi danh khỏi lớp",
        }
      },
    },

    classRoster: {
      title: "Danh Sách Học Sinh Của Lớp: {className}",
      description: "Vui lòng chọn lớp từ Lớp Học Của Tôi",
      name: "Tên",
      lastActivity: "Hoạt Động Gần Đây",
      actions: "Hành Động",
      search: "Tìm kiếm tên...",
      noStudent: "Không có học sinh trong lớp này",
      addStudentButton: "Thêm học sinh mới",
      toast: {
        successResetProgress: "Đặt lại tiến trình thành công",
        successResetProgressDescription: "Tất cả tiến trình đã được đặt lại",
      },
    
      addNewStudent: {
        title: "Thêm học sinh mới vào {className}",
        description: "Thêm học sinh mới vào lớp bằng cách nhập địa chỉ email của họ.",
        email: "Email: ",
        placeholder: "Nhập địa chỉ email",
        addStudent: "Thêm học sinh mới",
        warning: "Để thêm học sinh, vui lòng điền vào các trường bắt buộc ở trên.",
        saveButton: "LƯU VÀ TIẾP TỤC",
        toast: {
          successAddStudent: "Đã thêm học sinh",
          successAddStudentDescription: "Học sinh đã được thêm thành công vào lớp này.",
          errorAddStudent: "Thêm học sinh thất bại",
          errorAddStudentDescription: "Không thể thêm học sinh vào lớp này.",
          emailNotFound: "Không tìm thấy email",
          emailNotFoundDescription: "Địa chỉ email này không được liên kết với bất kỳ tài khoản nào. Vui lòng kiểm tra chính tả hoặc thử một địa chỉ email khác.",
        }
      },
    },

    reports: {
      title: "Báo Cáo Lớp Học: {className}",
      averageLevel: "Mức Trung Bình:",
      name: "Tên",
      xp: "XP",
      level: "Cấp Độ",
      search: "Tìm kiếm tên...",
      lastActivity: "Hoạt Động Gần Đây",
      actions: "Hành Động",
      detail: "Chi Tiết",
      viewDetails: "Xem Chi Tiết",
      noStudent: "Không có học sinh trong lớp này",
      noStudentDescription: "Vui lòng chọn lớp từ Lớp Học Của Tôi",
    
      editStudent: {
        title: "Chỉnh Sửa Chi Tiết Học Sinh",
        description: "Cập nhật chi tiết học sinh dưới đây",
        placeholder: "Tên học sinh",
        update: "Cập Nhật Học Sinh",
        cancel: "Hủy",
        toast: {
          successUpdate: "Cập Nhật Thành Công",
          successUpdateDescription: "Thông tin học sinh được cập nhật thành công",
          attentionUpdate: "Chú Ý",
          attentionUpdateDescription: "Vui lòng điền thông tin",
          errorUpdate: "Cập Nhật Thất Bại",
          errorUpdateDescription: "Không thể cập nhật thông tin học sinh",
        }
      },
      removeStudent: {
        title: "Xóa Học Sinh",
        descriptionBefore: "Bạn có muốn xóa",
        descriptionAfter: "khỏi lớp học này không?",
        remove: "Xóa",
        cancel: "Hủy",
        toast: {
          successRemove: "Xóa học sinh thành công",
          successRemoveDescription: "Học sinh đã được xóa thành công",
          errorRemove: "Lỗi",
          errorRemoveDescription: "Lỗi khi xóa học sinh khỏi lớp này",
        }
      },
    },
    
  },
} as const;
