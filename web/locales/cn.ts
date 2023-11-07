export default {
    pages: {
        indexPage: {
            description: '综合阅读应用, 集成了AI。目前正在进行Beta测试。',
            getStartedButton: '开始',
        },
        loginPage: {
            loginDescription: '登录到您的账户',
            backButton: '返回',
        },
        student: {
            homePage: {
                reminderToReread: '重读提醒',
                articleRecords: '文章记录',
                reminderToRereadDescription: '您可能想再次尝试阅读这些文章，以查看您是否有所提高。',
                articleRecordsDescription: '您的阅读记录将在这里显示。',
            },
            nextQuizPage: {
                articleSelection: '文章选择',
                article: {
                    articleNotFound: '找不到文章',
                    articleInsufficientLevel: '您的阅读水平不足，无法阅读此文章。',
                    readBefore: '您之前读过这篇文章',
                    readBeforeDescription: '您可以再次阅读并练习，以提高您的阅读技能。这是您之前阅读的结果。',
                    status: '状态',
                    statusText: {
                        completed: '已完成',
                        uncompleted: '未完成',
                    },
                    statusDescription: '最后更新于 {date}',
                    score: '测验分数',
                    scoreText: '{score}',
                    scoreDescription: '共 {total} 个问题',
                    rated: '已评分',
                    ratedText: '{rated} 分',
                    ratedDescription: '您对这篇文章的评分',
                    timeSpend: '花费时间',
                    timeSpendText: '{time}',
                    timeSpendDescription: '在 {total} 个问题中',
                    scoreSuffix: {
                        point: '分',
                        points: '分',
                    },
                    secondSuffix: {
                        second: '秒',
                        seconds: '秒',
                    },
                },
            },
            flashcardPage: {
                flashcard: '单词卡',
                flashcardDescription: '您可以使用单词卡来练习您的阅读技能，您保存的句子将在这里显示。',
                savedSentences: '保存的句子',
                noSavedSentences: '您没有保存的句子。',
                savedSentencesDescription: '您有 {total} 个保存的句子。',
                added: '添加于 {date}',
                deleteButton: '删除',
                toast: {
                    success: '成功',
                    successDescription: '成功删除保存的句子',
                    error: '错误',
                    errorDescription: '删除保存的句子时出错',
                }
            },
        },
    },
    components: {
        mainNav: {
            home: '主页',
            about: '关于',
            contact: '联系',
        },
        userAccountNav: {
            level: '等级 {level}',
            settings: '设置',
            signOut: '登出',
        },
        themeSwitcher: {
            dark: '暗模式',
            light: '亮模式',
            system: '系统',
        },
        localeSwitcher: {
            en: 'English',
            th: 'ไทย',
            cn: '简体字',
            tw: '繁體字',
            vn: 'Tiếng Việt',
        },
        sidebarNav: {
            articleRecords: '文章记录',
            nextQuiz: '下一个测验',
            flashcard: '单词卡',
        },
        articleRecordsTable: {
            title: '标题',
            date: '日期',
            rated: '已评分',
            search: '搜索标题...',
            previous: '上一个',
            next: '下一个',
            select: '已选择 {selected} 个，共 {total} 个',
        },
        select: {
            articleChoose: '请选择您想阅读的 {article}',
            articleChooseDescription: '您的级别是 {level}，这里是您可以选择的 {article}。',
        },
        article: {
            type: '文章类型',
            genre: '文章种类',
            subGenre: '文章子类',
        },
        articleCard: {
            raLevel: '阅读能力等级为 {raLevel}',
            cefrLevel: 'CEFR 等级为 {cefrLevel}',
            articleCardDescription: '该文章涉及 {topic} 主题，属于 {genre} 类别。',
        },
        articleContent: {
            voiceAssistant: '语音助手',
            soundButton: {
                play: '播放声音',
                pause: '暂停声音',
            },
        },
        mcq: {
            quiz: '测验',
            reQuiz: '重新测验',
            quizDescription: '开始测验以测试您的知识，并看看这篇文章对您来说有多容易。',
            reQuizDescription: '您之前完成过这个测验。您可以重新参加测验以提高您的分数。',
            startButton: '开始测验',
            retakeButton: '重新测验',
            elapsedTime: '已用时间 {time} 秒',
            questionHeading: '问题 {number}，共 {total} 个',
            nextQuestionButton: '下一个问题',
            toast: {
                correct: '正确',
                correctDescription: '您答对了！',
                incorrect: '错误',
                incorrectDescription: '您答错了！',
                quizCompleted: '测验完成',
                quizCompletedDescription: '您已完成测验',
                error: '错误',
                errorDescription: '提交答案时出错，请稍后再试。',
            },
        },
        rate: {
            title: '评价这篇文章',
            description: '此评分用于计算您下一级别。',
            newLevel: '您的新级别是 {level}',
            submitButton: '提交',
            backToHomeButton: '返回主页',
            nextQuizButton: '下一个测验',
            toast: {
                success: '成功',
                successDescription: '您的新级别是 {level}。',
            }
        },
        audioButton: {
            play: '播放声音',
            pause: '暂停声音',
        },
        menu: '菜单',
        loginButton: '登录',
    },
} as const;
