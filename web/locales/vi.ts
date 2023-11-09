export default {
    pages: {
        indexPage: {
            description: 'Ứng dụng đọc sách đa dạng tích hợp trí tuệ nhân tạo. Phiên bản beta và đang trong quá trình thử nghiệm.',
            getStartedButton: 'Bắt đầu',
        },
        loginPage: {
            loginDescription: 'Đăng nhập vào tài khoản của bạn',
            backButton: 'Quay lại',
        },
        student: {
            readPage: {
                // Headings
                articleSelection: 'Chọn bài viết',
                // Trang nextquiz/[articleId]
                article: {
                    articleNotFound: 'Không tìm thấy bài viết',
                    articleInsufficientLevel: 'Bạn không thể đọc bài viết này vì trình độ đọc của bạn chưa đủ.',
                    // Headings
                    readBefore: 'Bạn đã đọc bài viết này trước đây',
                    readBeforeDescription: 'Bạn có thể thử đọc và luyện tập lại để cải thiện kỹ năng đọc của mình. Đây là kết quả đọc trước đó của bạn.',
                    // Thống kê
                    status: 'Trạng thái',
                    statusText: {
                        completed: 'Hoàn thành',
                        uncompleted: 'Chưa hoàn thành',
                    },
                    statusDescription: 'Cập nhật lần cuối vào {date}',
                    score: 'Điểm bài kiểm tra',
                    scoreText: '{score}',
                    scoreDescription: 'từ {total} câu hỏi',
                    rated: 'Được đánh giá',
                    ratedText: '{rated} đánh giá',
                    ratedDescription: 'Bạn đã đánh giá bài viết này',
                    timeSpend: 'Thời gian đã dùng',
                    timeSpendText: '{time}',
                    timeSpendDescription: 'trong {total} câu hỏi',
                    scoreSuffix: {
                        point: 'điểm',
                        points: 'điểm',
                    },
                    secondSuffix: {
                        second: 'giây',
                        seconds: 'giây',
                    },
                },
            },
            historyPage: {
                // Headings
                reminderToReread: 'Lời nhắc đọc lại',
                articleRecords: 'Hồ sơ bài viết',
                // Descriptions
                reminderToRereadDescription: "Bạn có thể muốn đọc lại một trong những bài viết này để xem liệu bạn đã cải thiện chưa.",
                articleRecordsDescription: 'Hồ sơ đọc của bạn sẽ được hiển thị ở đây.',
            },
            practicePage: {
                // Headings
                flashcard: 'Thẻ học',
                // Descriptions
                flashcardDescription: 'Bạn có thể luyện tập kỹ năng đọc của mình với thẻ học. Và các câu đoạn đã lưu của bạn sẽ được hiển thị ở đây.',
                savedSentences: 'Câu đoạn đã lưu',
                noSavedSentences: 'Bạn chưa lưu câu đoạn nào.',
                savedSentencesDescription: 'Bạn đã lưu {total} câu đoạn.',
                added: 'Thêm vào {date}',
                deleteButton: 'Xóa',
                toast: {
                    success: 'Thành công',
                    successDescription: 'Xóa câu đoạn đã lưu thành công',
                    error: 'Lỗi',
                    errorDescription: 'Có lỗi xảy ra khi xóa câu đoạn đã lưu. Vui lòng thử lại sau.',
                }
            },
        }
    },
    components: {
        mainNav: {
            home: 'Trang chủ',
            about: 'Về chúng tôi',
            contact: 'Liên hệ',
        },
        userAccountNav: {
            level: 'Trình độ {level}',
            settings: 'Cài đặt',
            signOut: 'Đăng xuất',
        },
        themeSwitcher: {
            dark: 'Tối',
            light: 'Sáng',
            system: 'Hệ thống',
        },
        localeSwitcher: {
            en: 'English',
            th: 'ไทย',
            cn: '简体中文',
            tw: '繁體字',
            vi: 'Tiếng Việt',
        },
        sidebarNav: {
            read: 'Đọc',
            history: 'Lịch sử',
            practice: 'Luyện tập',
            reports: 'Báo cáo',
        },
        articleRecordsTable: {
            title: 'Tiêu đề',
            date: 'Ngày',
            rated: 'Đánh giá',
            search: 'Tìm kiếm tiêu đề...',
            previous: 'trước',
            next: 'sau',
            select: '{selected} trong {total} đã chọn',
        },
        // Sử dụng cho trang chọn bài viết
        // Đây là thành phần chọn
        select: {
            articleChoose: 'Hãy chọn bài viết {article} bạn muốn đọc',
            articleChooseDescription: 'Trình độ của bạn là {level} và đây là các bài viết {article} bạn có thể chọn.',
        },
        // Sử dụng cho trang chọn bài viết
        article: {
            type: 'Thể loại bài viết',
            genre: 'Thể loại bài viết',
            subGenre: 'Thể loại phụ bài viết',
        },
        articleCard: {
            raLevel: 'Trình độ đọc là {raLevel}',
            cefrLevel: 'Trình độ CEFR là {cefrLevel}',
            articleCardDescription: 'Bài viết liên quan đến chủ đề {topic}, thuộc thể loại {genre}.',
        },
        articleContent: {
            voiceAssistant: 'Trợ lý giọng nói',
            soundButton: {
                play: 'Phát âm thanh',
                pause: 'Tạm dừng âm thanh',
            },
        },
        mcq: {
            // Headings
            quiz: 'Bài kiểm tra',
            reQuiz: 'Làm lại bài kiểm tra',
            // Descriptions
            quizDescription: 'Bắt đầu bài kiểm tra để kiểm tra kiến thức của bạn. Và xem bài viết này có dễ không.',
            reQuizDescription: 'Bạn đã hoàn thành bài kiểm tra này trước đây. Bạn có thể làm lại để cải thiện điểm số của mình.',
            startButton: 'Bắt đầu bài kiểm tra',
            retakeButton: 'Làm lại bài kiểm tra',
            // Thẻ kiểm tra trắc nghiệm
            elapsedTime: '{time} giây đã trôi qua',
            questionHeading: 'Câu hỏi {number} trong tổng số {total}',
            nextQuestionButton: 'Câu hỏi tiếp theo',
            toast: {
                correct: 'Đúng',
                correctDescription: 'Bạn đã trả lời đúng!',
                incorrect: 'Sai',
                incorrectDescription: 'Bạn đã trả lời sai!',
                quizCompleted: 'Hoàn thành bài kiểm tra',
                quizCompletedDescription: 'Bạn đã hoàn thành bài kiểm tra',
                error: 'Lỗi',
                errorDescription: 'Có lỗi xảy ra khi gửi câu trả lời của bạn. Vui lòng thử lại sau.',
            },
        },
        rate: {
            title: 'Đánh giá bài viết này',
            description: 'Điểm đánh giá này được sử dụng để tính trình độ mới của bạn.',
            newLevel: 'Trình độ mới của bạn là {level}',
            submitButton: 'Gửi',
            backToHomeButton: 'Trở về Trang chủ',
            nextQuizButton: 'Bài kiểm tra tiếp theo',
            toast: {
                success: 'Thành công',
                successDescription: 'Trình độ mới của bạn là {level}.',
            }
        },
        audioButton: {
            play: 'Phát âm thanh',
            pause: 'Tạm dừng âm thanh',
        },
        menu: 'Menu',
        loginButton: 'Đăng nhập',
    },
} as const
