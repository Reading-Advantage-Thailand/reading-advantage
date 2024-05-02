export default {
  pages: {
    indexPage: {
      description:
        "Extensive reading app incorporating AI. Alpha version and testing in progress.",
      getStartedButton: "Get Started",
    },
    loginPage: {
      loginDescription: "Log in to your account",
      backButton: "Back",
    },
    testPage: {
      xxx: "Let's get started by testing your skill!",
    },
    student: {
      readPage: {
        //Headings
        articleSelection: "Article Selection",
        // nextquiz/[articleId] page
        article: {
          articleNotFound: "Article not found",
          articleInsufficientLevel:
            "You cannot read this article because your reading level is not high enough.",
          //headings
          readBefore: "Welcome back. You have read this article before",
          readBeforeDescription:
            "You might try reading and practicing again to improve your reading skills. Here is the result of your previous reading.",
          // stats
          status: "Status",
          statusText: {
            completed: "Completed",
            uncompleted: "Uncompleted",
          },
          statusDescription: "Last updated on {date}",
          score: "Quiz Score",
          scoreText: "{score}",
          scoreDescription: "from {total} questions",
          rated: "Rated",
          ratedText: "{rated} rating",
          ratedDescription: "You rated this article",
          timeSpend: "Time spend",
          timeSpendText: "{time}",
          timeSpendDescription: "in {total} questions",
          scoreSuffix: {
            point: "point",
            points: "points",
          },
          secondSuffix: {
            second: "second",
            seconds: "seconds",
          },
        },
      },
      historyPage: {
        //Headings
        reminderToReread: "Reminder to read",
        articleRecords: "Article Records",
        //descriptions
        reminderToRereadDescription:
          "You might want to try reading one of these articles again to see if you've improved.",
        articleRecordsDescription:
          "Your reading records will be displayed here.",
      },
      practicePage: {
        //Headings
        flashcard: "Flashcard",
        manage: "Manage",
        //descriptions
        flashcardDescription:
          "You can practice your reading skills with flashcards. and your saved sentences will be displayed here.",
        savedSentences: "Saved Sentences",
        noSavedSentences: "You have no saved sentences.",
        savedSentencesDescription: "Your have {total} saved sentences.",
        added: "Added {date}",
        deleteButton: "Delete",
        neverPracticeButton: "Never practice this sentence again",
        toast: {
          success: "Success",
          successDescription: "Delete saved sentence successfully",
          error: "Error",
          errorDescription:
            "Something went wrong while deleting saved sentence",
        },
        flashcardPractice: {
          buttonAgain: "Again",
          buttonHard: "Hard",
          buttonGood: "Good",
          buttonEasy: "Easy",
          flipCard: "Flip",
          nextButton: "Next",
          yourXp: "You've received {xp} XP for this activity.",
        },
        orderSentencesPractice: {
          //Order Sentences
          orderSentences: "Order Sentences",
          orderSentencesDescription:
            "These are some sentences from one of the passages you've read. Put the sentences in an order that makes sense to you. If the order is the same as the passage, you'll receive 5 XP.",
          saveOrder: "Continue",
          errorOrder: "Please order correctly",
        },
        clozeTestPractice: {
          clozeTest: "Cloze Test",
          clozeTestDescription:
            "Fill in the blanks with the correct word to complete the passage. For each correct answer, you'll receive 2 XP.",
          saveAnswer: "Continue",
          errorAnswer: "Please answer correctly",
          submitArticle: "Check your answers",
          nextPassage: "Next Passage",
        },
        orderWordsPractice: {
          orderWords: "Order Words",
          orderWordsDescription:
            "This is a sentence from one of the passages you've read. Put the words in an order that makes sense to you. If the order is the same as the passage, you'll receive 5 XP.",
          saveOrder: "Continue",
          errorOrder: "Please order correctly",
          submitArticle: "Check your answers",
          nextPassage: "Next Passage",
          tryToSortThisSentence: "Try to sort this sentence",          
        },
      },
    },
  },
  components: {
    mainNav: {
      home: "Home",
      about: "About",
      contact: "Contact",
      authors: "Authors",
    },
    userAccountNav: {
      level: "Level {level}",
      settings: "Settings",
      signOut: "Sign Out",
    },
    themeSwitcher: {
      dark: "Dark",
      light: "Light",
      system: "System",
    },
    localeSwitcher: {
      en: "English",
      th: "ไทย",
      cn: "简体字",
      tw: "繁體字",
      vi: "Tiếng Việt",
    },
    sidebarNav: {
      read: "Read",
      sentences: "Sentences",
      reports: "Reports",
      history: "History",
    },
    sidebarTeacherNav: {
      myClasses: "My Classes",
      myStudents: "My Students",
      classRoster: "Class Roster",
      reports: "Reports",
    },
    articleRecordsTable: {
      title: "Title",
      date: "Date",
      rated: "Rated",
      search: "Search title...",
      previous: "previous",
      next: "next",
      select: "{selected} of {total} selected",
    },
    firstRunLevelTest: {
      heading: "Let's get started by testing your skill!",
      description: "Choose the correct answer to assess your reading level.",
      nextButton: "Next",
      section: "Section {currentSectionIndex}",
      toast: {
        successUpdate: "Success!",
        successUpdateDescription: "Your XP and level has been updated.",
        attention: "Attention",
        attentionDescription: "Please answer all questions!",
        errorTitle: "Something went wrong.",
        errorDescription:
          "Your XP and level were not updated. Please try again.",
      },
      congratulations: "Congratulation!",
      congratulationsDescription: "The assessment is done.",
      yourScore: "Your Score : {xp}",
      yourCefrLevel: "Your CEFR Level : {cefrLevel}",
      yourRaLevel: "Your RA Level : {raLevel}",
      getStartedButton: "Get Started",
    },
    progressBarXp: {
      xp: "XP:",
      level: "Level {level}",
      congratulations: "Congratulations! ",
      upLevel: "You've achieved a new level.",
      close: "Close",
    },
    // use this for article selection page
    // this is the select component
    select: {
      articleChoose: "Please choose the {article} you want to read",
      articleChooseDescription:
        "Your level is {level} and here are the {article}s that you can choose.",
    },
    // use this for article selection page
    article: {
      type: "article type",
      genre: "article genre",
      subGenre: "article sub-genre",
      article: "article",
    },
    articleCard: {
      raLevel: "Reading Advantage level is {raLevel}",
      cefrLevel: "CEFR level is {cefrLevel}",
      // The article pertains to the topic of A clever girl outsmarts an evil sorceress and saves her village from a curse., which falls within the tales and myths genre.
      articleCardDescription:
        "The article pertains to the topic of {topic}, which falls within the {genre} genre.",
    },
    articleContent: {
      voiceAssistant: "Voice Assistant",
      soundButton: {
        play: "Play sound",
        pause: "Pause sound",
      },
      // button translate
      translateฺButton: {
        open: "",
        close: "",
      },
    },
    mcq: {
      //headings
      quiz: "Quiz",
      reQuiz: "Re-Quiz",
      //descriptions
      quizDescription:
        "Start the quiz to test your knowledge in order to see how easy this article is for you.",
      reQuizDescription:
        "You have completed this quiz before. You can retake the quiz to improve your score.",
      startButton: "Start Quiz",
      retakeButton: "Retake Quiz",
      // mcq card
      elapsedTime: "{time} seconds elapsed",
      questionHeading: "Question {number} of {total}",
      nextQuestionButton: "Next Question",
      toast: {
        correct: "Correct",
        correctDescription: "You got it right!",
        incorrect: "Incorrect",
        incorrectDescription: "You got it wrong!",
        quizCompleted: "Quiz Completed",
        quizCompletedDescription: "You have completed the quiz",
        error: "Error",
        errorDescription:
          "Something went wrong while submitting your answer. Please try again later.",
      },
    },
    rate: {
      title: "Rate this article",
      description: "This rating is used for calculating your next level.",
      newLevel: "Your new level is {level}",
      submitButton: "Submit",
      backToHomeButton: "Back to Home",
      nextQuizButton: "Next Quiz",
      toast: {
        success: "Success",
        successDescription: "Your new level is {level}.",
      },
    },
    audioButton: {
      play: "Play sound",
      pause: "Pause sound",
    },
    menu: "Menu",
    loginButton: "Login",
  },
} as const;
