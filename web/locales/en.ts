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
<<<<<<< HEAD
=======
    // use this for article selection page
    types: {
      // article type
      fiction: "fiction",
      // fiction
      "Adventure": "Adventure",
      "Horror": "Horror",
      "Epic": "Epic",
      "Media": "Media",
      "Romance": "Romance",
      "Classic Literature": "Classic Literature",
      "Western": "Western",
      "Drama": "Drama",
      "Fantasy": "Fantasy",
      "Science Fiction": "Science Fiction",
      "Dystopian Fiction": "Dystopian Fiction",
      "Mythology": "Mythology",
      "novel": "novel",
      "Folklore": "Folklore",
      "Mystery": "Mystery",
      "Comedy": "Comedy",
      "Literary Fiction": "Literary Fiction",
      "Family Drama": "Family Drama",
      // Adventure
      "Exploration": "Exploration",
      "Animal Adventure": "Animal Adventure",
      "Treasure Hunt": "Treasure Hunt",
      "Historical Fiction": "Historical Fiction",
      "Historical fiction": "Historical fiction",
      // Horror
      "Psychological Horror": "Psychological Horror",
      "Gothic horror": "Gothic horror",
      "Supernatural": "Supernatural",
      // media
      "World Literature": "World Literature",
      // romance
      "Young Adult": "Young Adult",
      "Contemporary Romance": "Contemporary Romance",
      // Classic Literature
      "Romantic Fiction": "Romantic Fiction",
      // western
      "Bounty Hunter": "Bounty Hunter",
      // drama
      "Coming-of-Age": "Coming-of-Age",
      // Historical fiction
      "Legendary": "Legendary",
      // fantasy
      "Time Travel": "Time Travel",
      "Mythical Creatures": "Mythical Creatures",
      "Epic Fantasy": "Epic Fantasy",
      "Urban Fantasy": "Urban Fantasy",
      "Magical Realism": "Magical Realism",
      "Supernatural Mystery": "Supernatural Mystery",
      // Science Fiction
      "Space Opera": "Space Opera",
      "Dystopian": "Dystopian",
      "Time Travel Comedy": "Time Travel Comedy",
      // dystopian fiction
      "Resistance": "Resistance",
      // Mythology
      "Hindu Mythology": "Hindu Mythology",
      "Aztec Mythology": "Aztec Mythology",
      "African Mythology": "African Mythology",
      "Andean Mythology": "Andean Mythology",
      "Creation Myth": "Creation Myth",
      "Greek Mythology": "Greek Mythology",
      // Folklore
      "Eastern European Folklore": "Eastern European Folklore",
      // Mystery
      "Detective Fiction": "Detective Fiction",
      "Psychological Thriller": "Psychological Thriller",
      // comedy
      "Superhero": "Superhero",
      // Historical Fiction
      "Medieval Adventure": "Medieval Adventure",
      "Harlem Renaissance": "Harlem Renaissance",
      "World War II Resistance": "World War II Resistance",
      // Literary Fiction
      "Existential Fiction": "Existential Fiction",
      "Modernist Literature": "Modernist Literature",
      "Existentialism": "Existentialism",
      // Drama
      "Domestic Life": "Domestic Life",
      // novel
      "drama": "drama",

      /* ------------------------------- */

      // article type non-fiction
      nonfiction: "nonfiction",
      // non-fiction
      "Entertainment": "Entertainment",
      "Film": "Film",
      "Psychology": "Psychology",
      "Social Issues": "Social Issues",
      "Earth Science": "Earth Science",
      "Science": "Science",
      "Biology": "Biology",
      "History": "History",
      "Paranormal": "Paranormal",
      "Arts": "Arts",
      "Environmental Science": "Environmental Science",
      "True Crime": "True Crime",
      "Technology": "Technology",
      "Education": "Education",
      "Sociology": "Sociology",
      "Art and Technology": "Art and Technology",
      "Natural Science": "Natural Science",
      "Biography": "Biography",
      "Business": "Business",
      "Sports": "Sports",
      "Nature": "Nature",
      "Self-help": "Self-help",
      "Travel Guide": "Travel Guide",
      "Memoir": "Memoir",
      "Health": "Health",
      "Science and Technology": "Science and Technology",
      "Religion": "Religion",
      "Educational": "Educational",
      "Health and Wellness": "Health and Wellness",
      "Self-Help": "Self-Help",
      "Natural Sciences": "Natural Sciences",
      "Cultural Celebration": "Cultural Celebration",
      "Travel": "Travel",
      "Visual Arts": "Visual Arts",
      "Music": "Music",
      "Cryptozoology": "Cryptozoology",
      "Social Sciences": "Social Sciences",
      "Medical": "Medical",
      "Political Science": "Political Science",
      "Natural History": "Natural History",
      "Religion and Spirituality": "Religion and Spirituality",
      // Entertainment
      "Podcasts": "Podcasts",
      "Film Industry": "Film Industry",
      // Psychology
      "Music and Memory": "Music and Memory",
      "Music Therapy": "Music Therapy",
      // Social Issues
      "Indigenous Rights": "Indigenous Rights",
      // Earth Science
      "Natural Disasters": "Natural Disasters",
      // Science
      "The Marvels of Earth's Magnetic Field": "The Marvels of Earth's Magnetic Field",
      "Renewable Energy": "Renewable Energy",
      "Astrophysics": "Astrophysics",
      "Geology": "Geology",
      "Scientist": "Scientist",
      "Animal Biology": "Animal Biology",
      "Ecology": "Ecology",
      "Paleontology": "Paleontology",
      "Physics": "Physics",
      "Botany": "Botany",
      "Marine Biology": "Marine Biology",
      "Evolution": "Evolution",
      "Astronomy": "Astronomy",
      "Space Exploration": "Space Exploration",
      "Meteorology": "Meteorology",
      // Biology
      "Animal Behavior": "Animal Behavior",
      "Animals": "Animals",
      "Wildlife": "Wildlife",
      "Organismal Biology": "Organismal Biology",
      "Herpetology": "Herpetology",
      "Aquatic Life": "Aquatic Life",
      "Animal Adaptations": "Animal Adaptations",    
      // History
      "Medieval History": "Medieval History",
      "Ancient Egypt": "Ancient Egypt",
      "Invention and Technology": "Invention and Technology",
      "European History": "European History",
      "World War II": "World War II",
      "War": "War",
      "Military History": "Military History",
      "Invention": "Invention",
      "Ancient Rome": "Ancient Rome",
      "Ancient Civilization": "Ancient Civilization",
      "Ancient History": "Ancient History",
      "Transportation and Communication": "Transportation and Communication",
      "Ancient Civilizations": "Ancient Civilizations",
      "Islamic History": "Islamic History",
      "Modern History": "Modern History",
      "Revolution": "Revolution",
      // Paranormal
      "Haunted Locations": "Haunted Locations",
      // Arts
      "Art Techniques": "Art Techniques",
      "Comics and Graphic Novels": "Comics and Graphic Novels",
      "Screenwriting": "Screenwriting",
      // Environmental Science
      "Marine Pollution": "Marine Pollution",
      "Land Degradation": "Land Degradation",

      // True Crime
      "Serial Killers": "Serial Killers",
      // Technology
      "Wearable Technology": "Wearable Technology",
      "History and Evolution": "History and Evolution",
      "Mobile Technology": "Mobile Technology",
      "Internet": "Internet",
      "History and Impact": "History and Impact",
      // Education
      "STEAM Education": "STEAM Education",
      "Technology in Education": "Technology in Education",
      "Diversity and Inclusion": "Diversity and Inclusion",
      // Sociology
      "Global Collaboration": "Global Collaboration",
      // Art and Technology
      "Digital Art": "Digital Art",
      // Natural Science
      "Aquatic Biology": "Aquatic Biology",
      "Wildlife Biology": "Wildlife Biology",
      // Biography
      "Inventors": "Inventors",
      "Historical": "Historical",
      "Art History": "Art History",
      "Civil Rights Movement": "Civil Rights Movement",
      "Philosophy": "Philosophy",
      // Business
      "Art Entrepreneurship": "Art Entrepreneurship",
      // sports
      "Sports Media": "Sports Media",
      "Inspirational": "Inspirational",
      "Media Coverage": "Media Coverage",
      "Women in Sports": "Women in Sports",
      // nature
      "Marine Life": "Marine Life",
      "Bird Watching": "Bird Watching",
      "Wildlife Conservation": "Wildlife Conservation",
      // Self-help
      "Relationships": "Relationships",
      "Personal Development": "Personal Development",
      "Communication Skills": "Communication Skills",
      // Travel Guide
      "City Guide": "City Guide",
      // Memoir
      "Medical Memoir": "Medical Memoir",
      // Horror
      "Legends": "Legends",
      // Health
      "Medical Profession": "Medical Profession",
      "Public Health": "Public Health",
      "Epidemiology": "Epidemiology",
      // Science and Technology
      "Home Appliances": "Home Appliances",
      "Music Technology": "Music Technology",
      "History and Innovation": "History and Innovation",
      // Religion
      "Judaism": "Judaism",
      // Educational
      "Media Literacy": "Media Literacy", 
      // Health and Wellness
      "Physical Fitness": "Physical Fitness",
      "Alternative Medicine": "Alternative Medicine",    
      "Fitness": "Fitness",
      // Self-help
      "Time Management": "Time Management",
      // Natural Sciences
      // Cultural Celebration 
      "Indigenous Festivals": "Indigenous Festivals",
      "Traditional Festival": "Traditional Festival",
      // Travel
      "Travel Guides": "Travel Guides",
      "Cultural Festival": "Cultural Festival", 
      // Visual Arts
      "Film and Fine Art": "Film and Fine Art",
      // Music
      "Biographies": "Biographies",    
      "Social Issues in Music": "Social Issues in Music",
      "History of Music Innovation": "History of Music Innovation",
      "Musical Collaboration": "Musical Collaboration",
      "Exploration of Music Genres": "Exploration of Music Genres", 
      "Musical Collaborations": "Musical Collaborations",
      "Music History": "Music History",
      // "Cryptozoology   
      "Legendary Creatures": "Legendary Creatures",
      "Cryptids": "Cryptids",
      "Cryptids and Mythical Beasts": "Cryptids and Mythical Beasts",
      // Mythology
      "Australian Aboriginal Mythology": "Australian Aboriginal Mythology", 
      "Australian Aboriginal": "Australian Aboriginal",
      // Social Sciences
      // Medical
      "Cardiology": "Cardiology",    
      // Political Science
      "Global Governance": "Global Governance",
      // Natural History
      "Birds": "Birds",
      "Extinction and Conservation": "Extinction and Conservation",
      "Evolutionary Biology": "Evolutionary Biology", 
      "Insects": "Insects",
      "Ornithology": "Ornithology",    
      "Arctic Wildlife": "Arctic Wildlife",
      "Mammalogy": "Mammalogy",
      "Prehistoric Animals": "Prehistoric Animals",
      // Religion and Spirituality
      "Indigenous Beliefs": "Indigenous Beliefs", 
    },

>>>>>>> 2b400a1 (rebase commit)
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
  },
} as const;
