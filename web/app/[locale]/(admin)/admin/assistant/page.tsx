'use client';
import React from 'react'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SuggestionItem } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { set } from 'lodash';
import { Icons } from '@/components/icons';
import { UserAvatar } from '@/components/user-avatar';
import { toast } from '@/components/ui/use-toast';
import { CopyBlock, dracula } from 'react-code-blocks';
// The assistants have the following commands:
// /about the user may define the type, genre, subgenre, topic, wordcount, and target words per sentence
// ---
// /outline write an outline STRICTLY to the specification
// ---
// /passage write the passage to to outline and TO A MINIMUM of the wordcount
// ---
// /revise revise the passage to be longer and more aligned to the the requirements
// ---
// /assets create a title, one-sentence summary with no spoilers, and a description of an image to be displayed with the passage
// ---
// /json
// Return everything only in JSON using this format:
// {
// "type": "fiction"
// genre: if no genre is provided, choose one randomly
// subgenre: if no subgenre is provided, choose one randomly
// topic: if no specific topic is provided, choose one randomly
// target-wordcount: if no wordcount is specified, the passage should be AT LEAST 400 words long
// target-words-per-sentence:
// outline: write a basic outline of the passage before writing the actual passage
// passage: write the passage strictly to the target wordcount or greater AND NO SHORTER, following the outline, above
// summary: a one-sentence summary with no spoilers
// title: an interesting and level-appropriate title
// image: a detailed description of an image to go with the article.
// }

type Props = {}

const getAssistant = async (assistantID: string, command: string) => {
    try {
        const res = await fetch('/api/assistant', {
            method: 'POST',
            body: JSON.stringify({
                assistantId: assistantID,
                command: command,
            })
        });
        console.log('res', res);
        const data = await res.json();
        return data;
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
        })
        return [];
    }

}

const suggesstions: SuggestionItem[] = [
    {
        name: 'about',
        command: '/about',
        desc: 'Type, genre, subgenre, topic, wordcount, and target words per sentence can be defined.',
        format: 'Format: /about type=\'fiction\' genre=\'fantasy\' subgenre=\'urban fantasy\' topic=\'werewolves\' wc=500 twps=15',
        args: [
            'type',
            'genre',
            'subgenre',
            'topic',
            'wc',
            'twps',
        ],
    },
    {
        name: 'outline',
        command: '/outline',
        desc: 'Write an outline STRICTLY to the specification',
    },
    {
        name: 'passage',
        command: '/passage',
        desc: 'Write the passage to to outline and TO A MINIMUM of the wordcount',
    },
    {
        name: 'revise',
        command: '/revise',
        desc: 'Revise the passage to be longer and more aligned to the the requirements',
    },
    {
        name: 'assets',
        command: '/assets',
        desc: 'Create a title, one-sentence summary with no spoilers, and a description of an image to be displayed with the passage',
    },
    {
        name: 'json',
        command: '/json',
        desc: 'Return everything only in JSON using this format',
    }
]
type Assistant = {
    name: string;
    id: string;
}
const assistants: Assistant[] = [
    {
        name: 'CEFR C1-C2 Fiction Writer',
        id: 'C1C2_FICTION_WRITER',
    },
    {
        name: 'CEFR C1-C2 Nonfiction Writer',
        // id: 'C1-C2-Nonfiction-Writer',
        id: 'C1C2_NONFICTION_WRITER',
    },
    {
        name: 'CEFR B2 Fiction Writer',
        // id: 'B2-Fiction-Writer',
        id: 'B2_FICTION_WRITER',
    },
    {
        name: 'CEFR B2 Nonfiction Writer',
        // id: 'B2-Nonfiction-Writer',
        id: 'B2_NONFICTION_WRITER',
    },
    {
        name: 'CEFR B1 Nonfiction Writer',
        // id: 'B1-Nonfiction-Writer',
        id: 'B1_NONFICTION_WRITER',
    },
    {
        name: 'CEFR B1 Fiction Writer',
        // id: 'B1-Fiction-Writer',
        id: 'B1_FICTION_WRITER',
    },
    {
        name: 'CEFR A1 Nonfiction Writer',
        // id: 'A1-Nonfiction-Writer',
        id: 'A1_NONFICTION_WRITER',
    },
    {
        name: 'CEFR A1 Fiction Writer',
        // id: 'A1-Fiction-Writer',
        id: 'A1_FICTION_WRITER',
    },
    {
        name: 'CEFR A2 Fiction Writer',
        // id: 'A2-Fiction-Writer',
        id: 'A2_FICTION_WRITER',
    },
    {
        name: 'CEFR A2 Nonfiction Writer',
        // id: 'A2-Nonfiction-Writer',
        id: 'A2_NONFICTION_WRITER',
    },

]

export default function AdminAssistantPage({ }: Props) {
    const [messages, setMessages] = React.useState<any[]>([]);
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState('');
    const [suggestionIndex, setSuggestionIndex] = React.useState(0);
    const [selectedAssistant, setSelectedAssistant] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                setSuggestionIndex((prevIndex) => prevIndex === suggesstions.length - 1 ? 0 : prevIndex + 1);
            }
            if (e.key === 'ArrowUp') {
                setSuggestionIndex((prevIndex) => prevIndex === 0 ? suggesstions.length - 1 : prevIndex - 1);
            }
            if (e.key === 'Enter') {
                setText(suggesstions[suggestionIndex].command);
                setSuggestionIndex(0);
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [suggestionIndex, setSuggestionIndex]);

    const onSubmit = async () => {
        setOpen(false);
        const commandRegex = /^\/(about|outline|passage|revise|assets|json)/;
        if (!selectedAssistant) {
            return toast({
                title: 'Error',
                description: 'Please select an assistant',
                variant: 'destructive'
            })
        } else if (!commandRegex.test(text)) {
            return toast({
                title: 'Error',
                description: 'Please enter a valid command /about, /outline, /passage, /revise, /assets, /json',
                variant: 'destructive'
            })
        }
        else {
            setIsLoading(true);
            const command = text;
            const assistant = selectedAssistant;
            console.log('command', command);
            console.log('assistant', assistant);
            try {
                const data = await getAssistant(
                    assistant,
                    command,
                );
                console.log('data', data.messages);
                if (!data) {
                    console.warn('Empty response from getAssistant');
                    return;
                }
                setText('');
                setMessages(data.messages);
            } catch (error) {
                console.error('Error fetching or parsing data:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    const data = [
        {
            id: 'msg_HirGkW4z0oWuFMNk0XHJo28a',
            object: 'thread.message',
            created_at: 1704096511,
            thread_id: 'thread_il20tnu6zyUL8st5z3I8vIK2',
            role: 'assistant',
            content: [Array],
            file_ids: [],
            assistant_id: 'asst_JNr1HJOw6yMXCV1jVmAefW9T',
            run_id: 'run_h3iqFs1EO5IKtPNQlWtgWGcH',
            metadata: {}
        },
        {
            id: 'msg_tkfeOdr5LwMQDrtihs4spzxo',
            object: 'thread.message',
            created_at: 1704096510,
            thread_id: 'thread_il20tnu6zyUL8st5z3I8vIK2',
            role: 'user',
            content: [Array],
            file_ids: [],
            assistant_id: null,
            run_id: null,
            metadata: {}
        }
    ]

    return (
        <div className='mb-10 flex flex-col space-y-4'>

            <Select
                onValueChange={(value) => {
                    setSelectedAssistant(value);
                }}
            >
                <SelectTrigger
                    style={{
                        boxShadow: 'none',
                    }}
                    className="w-[260px]"
                >
                    <SelectValue placeholder="Select an assistant" />
                </SelectTrigger>
                <SelectContent
                >
                    {
                        assistants.map((assistant, index) => {
                            return (
                                <SelectItem
                                    key={index}
                                    value={assistant.id}
                                // onClick={(value) => {
                                //     console.log('click')
                                //     // setSelectedAssistant(assistant.id);
                                //     console.log('selectedAssistant', value);
                                // }}
                                >
                                    {assistant.name}
                                </SelectItem>
                            )
                        })
                    }
                </SelectContent>
            </Select>
            <div className='h-[70vh] overflow-y-scroll'>
                {
                    messages.map((message, index) => {
                        return (
                            <div key={index}>
                                {/* <p>{message.role}</p> */}
                                <div className='flex gap-2 mb-2'>
                                    <Badge
                                        variant={message.role === 'assistant' ? 'default' : 'secondary'}>
                                        {message.role}
                                    </Badge>
                                    <p
                                        className='text-sm text-muted-foreground'
                                    >

                                        {formatDate({
                                            _nanoseconds: message.created_at * 1000000,
                                            _seconds: message.created_at,
                                        })}
                                    </p>
                                </div>
                                <p
                                    className='p-2 rounded-md border-solid border-[1px] border-slate-800 mb-2'
                                >
                                    {
                                        message.content[0].text.value.startsWith('{') && message.content[0].text.value.endsWith('}') ? (
                                            // <pre>
                                            //     <code className='language-json'>
                                            //         {message.content[0].text.value}
                                            //     </code>
                                            // </pre>
                                            <CopyBlock
                                                text={message.content[0].text.value}
                                                language={'json'}
                                                showLineNumbers={true}
                                                theme={dracula}
                                            />
                                        ) : <p>
                                            {message.content[0].text.value}
                                        </p>
                                    }
                                </p>
                            </div>
                        )
                    })
                }
            </div>
            <div
                className='relative'
            >

                <Input
                    id='command'
                    name='command'
                    type='text'
                    autoCorrect="off"
                    style={{
                        boxShadow: 'none',
                    }}
                    placeholder='Type your message here'
                    onChange={(e) => {
                        setText(e.target.value);
                        setOpen(e.target.value.length > 0);
                    }}
                    value={text}
                    disabled={isLoading}
                    required
                />
                {
                    open && (
                        <div className='absolute bottom-10 left-0 right-0 border-solid border-[1px] p-2 rounded-md bg-slate-900 shadow-2xl'>
                            <p className='text-sm text-muted-foreground mb-3'>
                                Suggesstions
                            </p>
                            {
                                //find suggestions that match the text
                                suggesstions.filter((suggestion) => {
                                    return suggestion.command.startsWith(text) || text.startsWith(suggestion.command);
                                }).map((suggestion, index) => {
                                    return (
                                        <SuggestionItem
                                            key={index}
                                            suggestion={suggestion}
                                            setText={setText}
                                            isSeletected={index === suggestionIndex}
                                        />
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>
            <Button
                onClick={onSubmit}
                type='submit'
                // onClick={() => onAssistantResponse()}
                variant='secondary'
                disabled={isLoading}
            >
                {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Get Assistant Response
            </Button>
        </div >
    )
}

function SuggestionItem({ suggestion, setText, isSeletected }: { suggestion: SuggestionItem, setText: (text: string) => void, isSeletected?: boolean }) {
    return (
        <div
            className={cn('flex flex-col gap-2 text-sm hover:bg-slate-600 text-slate-300 p-2 rounded-md mb-2 cursor-pointer', {
                'bg-slate-700': isSeletected,
            })}
            onClick={() => {
                setText(suggestion.command);
            }}
        >
            <div className='flex gap-2'>
                <Badge>
                    {suggestion.command}
                </Badge>
                {
                    suggestion.args?.map((arg, index) => {
                        return (
                            <Badge
                                key={index}
                                variant='secondary'
                            >
                                {arg}:
                            </Badge>
                        )
                    })
                }
            </div>
            <p>
                {suggestion.desc}
                <p className='text-blue-400'>
                    {suggestion.format}
                </p>
            </p>
        </div>
    )
}