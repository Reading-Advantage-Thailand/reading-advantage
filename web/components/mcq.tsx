import { Box, Button, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { on } from 'events'
import React, { use, useEffect, useState } from 'react'


type Props = {
    questions: any,
    articleId: string
    setIsQuestionCompleted: React.Dispatch<React.SetStateAction<boolean>>
}

const MCQ = (props) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [correctAnswers, setCorrectAnswers] = useState([]); // Use an array to track correct answers
    const [correctAnswer, setCorrectAnswer] = useState(''); // correct answer for current question
    const [isAnswered, setIsAnswered] = useState(false);
    useEffect(() => {
        console.log('props.questions', props.questions);

    }, [props.questions]);

    const handleNextQuestion = () => {
        setSelectedAnswer('');
        setCorrectAnswer('');
        if (currentQuestion + 1 >= props.questions.multiple_choice_questions.length) {
            // alert('You have finished the article');
            props.setIsQuestionCompleted(true);
            return;
        }
        setCurrentQuestion(currentQuestion + 1);
        setIsAnswered(false);
    };

    const onAnswerSelected = async (answer) => {
        setIsAnswered(true);
        if (isAnswered) return;
        setSelectedAnswer(answer);
        const descriptorId = props.questions.multiple_choice_questions[currentQuestion].descriptor_id;

        const url = `/api/articles/${props.articleId}/questions/${descriptorId}`;
        try {
            const res = await axios.post(url, {
                answer: answer,
            });
            const isCorrect = res.data.data.isCorrect;
            const correctAnswer = res.data.data.correctAnswer;

            if (isCorrect) {
                setCorrectAnswers([...correctAnswers, true]); // Add true for correct answer
                setCorrectAnswer(correctAnswer);

            } else {
                setCorrectAnswers([...correctAnswers, false]); // Add false for incorrect answer
                setCorrectAnswer(correctAnswer);
            }

        } catch (error) {
            setIsAnswered(false);
            console.error('Error:', error);
        }
    };

    // useEffect(() => {
    //     console.log('correctAnswers', correctAnswers);
    // }, [correctAnswers]);

    return (
        <div>
            <Box sx={{ display: 'flex', flexDirection: 'row', bgcolor: 'background.paper' }}>
                {props.questions.multiple_choice_questions.map((question, index) => (
                    <Box
                        key={index}
                        sx={{
                            px: 2,
                            py: 1,
                            m: 0.2,
                            borderRadius: 2,
                            color: 'white',
                            bgcolor: correctAnswers[index] ? 'green' : correctAnswers[index] === false ? 'red' : 'blue', // Check for true, false, and default (blue)
                        }}
                    >
                        {index + 1}
                    </Box>

                ))}
            </Box>
            <Question
                index={currentQuestion}
                onAnswerSelected={onAnswerSelected}
                question={props.questions.multiple_choice_questions[currentQuestion].question}
                choices={Object.values(props.questions.multiple_choice_questions[currentQuestion].answers)}
                id={props.questions.multiple_choice_questions[currentQuestion].descriptor_id}
                correctAnswer={correctAnswer}
                handleNextQuestion={handleNextQuestion}
                isAnswered={isAnswered}
                questionLength={props.questions.multiple_choice_questions.length}
            />
        </div>
    );
};

// question component
const Question = (
    props: {
        onAnswerSelected: (answer: string) => void
        id: string
        question: string
        choices: string[]
        correctAnswer: string
        handleNextQuestion: () => void
        isAnswered: boolean
        questionLength: number
        index: number
    }
) => {
    return (
        <div>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {props.question} {props.id}
            </Typography>
            <Stack spacing={2} mt='1rem'>
                {
                    props.choices.map((choice) => {
                        return (
                            <Button
                                variant='contained'
                                key={choice}
                                sx={{ flexGrow: 1 }}
                                color={choice === props.correctAnswer ? 'success' : 'primary'}
                                onClick={
                                    () => {
                                        props.onAnswerSelected(choice)
                                    }
                                } >
                                {choice}
                            </Button>
                        )
                    }
                    )
                }
            </Stack>
            {
                // Dont show when question is last question
                props.questionLength - 1 !== props.index &&
                <Button

                    variant='contained'
                    sx={{ flexGrow: 1, mt: '1rem' }}
                    onClick={props.handleNextQuestion}
                    disabled={!props.isAnswered}
                >
                    Next Question
                </Button>
            }

        </div>
    )
}
export default MCQ

