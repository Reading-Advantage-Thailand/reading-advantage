
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Icons } from "../../../../components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { headers } from "next/headers";
// import { useState, useEffect } from "react";



type Props = {
    //   userId: string;
    // levelTestData: any,
};

// const [shuffledQuestions, setShuffledQuestions] = useState([]);   

async function getLevelTestData() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/level-test`,
        {
            method: "GET",
            headers: headers(),
        }
        );
        return res.json();
    }
    
    export default async function FirstRunLevelTest() {
        // const [loading, setLoading] = useState(false);
        const resGeneralDescription = await getLevelTestData();
       
        //     "language_placement_test": [
        //       {
        //         "level": "A0",
        //         "points": 3000,
        //         "questions": [
        //           {
        //             "prompt": "Is this a book?",
        //             "options": {
        //               "A": "Yes, it is a book.",
        //               "B": "No, it's a pen.",
        //               "C": "Yes, it's a table."
        //             }
        //           },
        //           {
        //             "prompt": "Good morning!",
        //             "options": {
        //               "A": "Good morning!",
        //               "B": "It's evening.",
        //               "C": "Thank you!"
        //             }
        //           },
        //           {
        //             "prompt": "Do you have a cat?",
        //             "options": {
        //               "A": "No, I have a dog.",
        //               "B": "Yes, a big dog.",
        //               "C": "I like cats."
        //             }
        //           },
        //           {
        //             "prompt": "What is your name?",
        //             "options": {
        //               "A": "My name is Anna.",
        //               "B": "I am fine.",
        //               "C": "Goodbye."
        //             }
        //           },
        //           {
        //             "prompt": "How are you?",
        //             "options": {
        //               "A": "I am good, thank you.",
        //               "B": "I am Anna.",
        //               "C": "Yes, I am here."
        //             }
        //           },
        //           {
        //             "prompt": "Is this your pen?",
        //             "options": {
        //               "A": "Yes, it's mine.",
        //               "B": "No, it's a book.",
        //               "C": "Yes, it's a cat."
        //             }
        //           }
        //         ]
        //       },
        //     ]};
        
        const questions = JSON.parse(JSON.stringify(resGeneralDescription.language_placement_test[0].questions));
// console.log(questions);

        //shuffle questions
        for (let i = questions.length -1; i > 0; i-- ) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
      // select the first 'numQuestions' questions
      const shuffledQuestions = questions.slice(0, 3);


      // log only the correct choice for each selected question
      shuffledQuestions.forEach((prompt: { options: Record<string, string> }) => {
        let choices = Object.entries(prompt.options);
        // console.log(choices);
        
        // shuffle the choices
        for (let i = choices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        prompt.options = Object.fromEntries(choices);
        const shuffledChoices = prompt.options;
        const randomPosition = Math.floor(Math.random() * (choices.length + 1));
        choices.splice(randomPosition, 0);
        console.log(choices.splice(randomPosition, 0));
        
        // console.log(randomPosition);
        // console.log(shuffledChoices);
        
        
      });

      // Insert the correct answer at a random position

  return (
    <>
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl md:text-2xl">
              Please select your language
            </DialogTitle>
          </DialogHeader>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <Card>
            <CardContent>
            <CardTitle className='font-bold text-2xl md:text-2xl'>
                        Please select your language
                    </CardTitle>
            </CardContent>
        </Card> */}
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl md:text-2xl">
            Let&apos;s get start by testing your skill!
          </CardTitle>
          <CardDescription>
            Choose the correct answer to assess your reading level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {/* <pre>{JSON.stringify(resGeneralDescription, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(resGeneralDescription.language_placement_test[0], null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(shuffledQuestions)}</pre> */}
          </div>
          <div>
            <h1>
            Section 1
            </h1>
            {shuffledQuestions.map((question: { prompt: string, options: Record<string, string> }, index: number) => (
              <div key={index}>
                <p className="font-bold">{index + 1}. {question.prompt}</p>
                {Object.entries(question.options).map(([key, value]) => (
                  <div key={key}>
                    <input type="radio" value={key} id={key} className="mr-3"/>
                    {value}
                  </div>
                ))}
              </div>
            ))
            }
          </div>
        </CardContent>

      </Card>
      <div className="flex items-center pt-4">
        <Button
          size="lg"
          // disabled={loading}
        >
          {/* {loading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )} */}
          <span>Next</span>
        </Button>
      </div>
    </>
  );
}
