import { error, warn } from "console";
import { assign, create, last } from "lodash";
import { arch } from "os";
import { title } from "process";
import { toast } from "react-toastify";

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
        orderSentences: "Order Sentences",
        clozeTest: "Cloze Test",
        orderWords: "Order Words",
        matching: "Matching",
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
        matchingPractice: {
          matching: "Matching",
          matchingDescription:
            "Match the sentence with its translation. If you match all the sentences correctly, you'll receive 5 XP.",
          saveOrder: "Save & Continue Later",
          errorOrder: "Please order correctly",
          submitArticle: "Check your answers",
          nextPassage: "Next Passage",
          minSentencesAlert:
            "You need at least five saved sentences to play this activity.",
        },
      },
    },
    teacher: {
      studentProgressPage: {
        activity: "Activity",
        level: "Level",
        levelDescription: "Your current level is {level}",
        progressOf: "Progress of {nameOfStudent}",
        noUserProgress: "No user progress available due to the student has never been read article or other activity.",
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
      passages: "Passages",
      assignments: "Assignments",
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
      type: "type",
      genre: "genre",
      subGenre: "sub-genre",
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
      content: "How do you rate the quality of this article?",
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

    passages: {
      heading: "Passages",
      type: "Type",
      fiction: "Fiction",
      nonFiction: "Non-Fiction",
      topic: "Topic",
      selectGenre: "Select Genre",
      selectSubGenre: "Select Subgenre",
      level: "Level",
    },
    myClasses: {
      title: "My Classes",
      search: "Search class name...",
      className: "Class Name",
      classCode: "Class Code",
      studentCount: "No. of Students",
      actions: "Actions",
      detail: "Detail",
      roster: "Roster",
      reports: "Reports",

      createNewClass: {
        button: "Create New Class",
        title: "Create a new class",
        description: "Fill in the details to create a new class",
        className: "Class Name",
        selectGrade: "Select Grade",
        grade: "Grade",
        create: "Create Class",
        cancel: "Cancel",
        toast: {
          attention: "Attention",
          attentionDescription: "All fields must be filled out!",
          successCreate: "Success",
          successDescription: "Class created successfully",
        },
      },

      edit: {
        title: "Edit Class Details",
        description: "Update the class details below",
        className: "Class Name",
        selectGrade: "Select Grade",
        grade: "Grade",
        toast: {
          attention: "Attention",
          attentionDescription: "All fields must be filled out!",
          successUpdate: "Update Successfully",
          successUpdateDescription: "Class updated successfully",
        },
        update: "Update Class",
        cancel: "Cancel",
      },

      archieve: {
        title: "Archive Class",
        descriptionBefore: "Do you want to archive ",
        descriptionAfter: " class?",
        archive: "Archive",
        cancel: "Cancel",
        toast: {
          successArchive: "Class archived",
          successArchiveDescription: "Class has been archived successfully!",
          errorArchive: "Error",
          errorArchiveDescription:
            "An error occurred while archiving the class",
        },
      },

      delete: {
        title: "Delete Classroom",
        descriptionBefore: "Do you want to delete ",
        descriptionAfter: " classroom?",  
        delete: "Delete",
        cancel: "Cancel",
        toast: {
          successDelete: "Class deleted",
          successDeleteDescription: "Class has been deleted successfully",
          errorDelete: "Error",
          errorDeleteDescription: "An error occurred while deleting the class",
        },
        },
      },

    myStudent: {
      title: "My Students",
      name: "Name",
      email: "Email",
      searchName: "Search name...",
      actions: "Actions",
      progress: "Progress",
      enroll: "Enroll",
      unEnroll: "Unenroll",
      resetProgress: "Reset Progress",
      resetTitle: "Reset all XP progress",
      resetDescription: "Are you sure you want to reset all progress?",
      reset: "Reset",
      cancelReset: "Cancel",

      enrollPage: {
        title: "Available enrolled class for {studentName}",
        add: "Add",
        search: "Search...",
        className: "Class Name",
        enroll: "Enroll",
        toast: {
          successEnrollment: "Successfully enrolled",
          successEnrollDescription: "Student has been enrolled in the class",
          errorEnrollment: "Enrollment Failed",
          errorEnrollDescription: "Student has not been enrolled in the class",
        }

      }, 
      unEnrollPage: {
        title: "Unenroll classes for {studentName}",
        remove: "Remove",
        search: "Search...",
        className: "Class Name",
        unEnroll: "Unenroll",
        toast: {
          successUnenrollment: "Successfully removed",
          successUnenrollDescription: "Student has been removed from class",
          errorUnenrollment: "Unenrollment Failed",
          errorUnenrollDescription: "Student has not been removed from the class",
        }
      },
    },

    classRoster: {
      title: "Roster for classroom: {className}",
      description: "Please select class from My Classes",
      name: "Name",
      lastActivity: "Last Activity",
      actions: "Actions",
      search: "Search name...",
      noStudent: "No student in this class",
      addStudentButton: "Add new students",
      toast: {
        successResetProgress: "Successfully reset progress",
        successResetProgressDescription: "All progress has been reset",
      },

      addNewStudent: {
        title: "Add new Students to {className}",
        description: "Add new students to the classroom by entering their email addresses.",
        email: "Email: ",
        placeholder: "Enter email address",
        addStudent: "Add new student",
        warning: "To add a student, please fill in the required fields above.",
        saveButton: "SAVE AND CONTINUE",
        toast: {
          successAddStudent: "Student added",
          successAddStudentDescription: "Student successfully added to this class.",
          errorAddStudent: "Failed to add student",
          errorAddStudentDescription: "Failed to add student to this class.",
          emailNotFound: "Email not found",
          emailNotFoundDescription: "This email address isn't associated with any account. Please check the spelling or try a different email address.",  
        }
      },
    },

    reports: {
      title: "Class Reports: {className}",
      averageLevel: "Average Level:",
      name: "Name",
      xp: "XP",
      level: "Level",
      search: "Search name...",
      lastActivity: "Last Activity",
      actions: "Actions",
      detail: "Detail",
      viewDetails: "View Details",
      noStudent: "No student in this class",
      noStudentDescription: "Please select class from My Classes",

      editStudent: {
        title: "Edit Student Details",
        description: "Update the student detail below",
        placeholder: "Student name",
        update: "Update Student",
        cancel: "Cancel",
        toast: {
          successUpdate: "Update Successful",
          successUpdateDescription: "Student information updated successfully",
          attentionUpdate: "Attention", 
          attentionUpdateDescription: "Please fill in information",
          errorUpdate: "Update Failed",
          errorUpdateDescription: "Failed to update student information",
        }
      },
      removeStudent: {
        title: "Remove Student",
        descriptionBefore: "Do you want to remove ",
        descriptionAfter: " from this classroom?",
        remove: "Remove",
        cancel: "Cancel",
        toast: {
          successRemove: "Student successfully removed",
          successRemoveDescription: "Student has been removed successfully",
          errorRemove: "Error",
          errorRemoveDescription: "Error removing student in this class",
        }
      },
    },
  },
} as const;
