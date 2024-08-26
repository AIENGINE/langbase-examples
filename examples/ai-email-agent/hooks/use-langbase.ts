import { fromReadableStream } from 'langbase';
import { useState } from 'react';
import { toast } from 'sonner';

const useLangbase = () => {
	const [inputEmail, setInputEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [completedSteps, setCompletedSteps] = useState({});
	const [emailReply, setEmailReply] = useState('');

	const analyzeSentiment = async (email: string) => {
		const response = await fetch('/api/sentiment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email })
		});

		const data = await response.json();
		return data;
	};

	const summarizeEmail = async (email: string) => {
		const response = await fetch('/api/summarize', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email })
		});

		const data = await response.json();
		return data;
	};

	const shouldRespondToEmail = async (summary: string, sentiment: string) => {
		const response = await fetch('/api/respond', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ summary, sentiment })
		});

		const data = await response.json();
		return data;
	};

	const pickEmailWriter = async (summary: string, sentiment: string) => {
		const response = await fetch('/api/pick-email-writer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ summary, sentiment })
		});

		const data = await response.json();
		return data;
	};

	const generateEmailReply = async (writer: string, emailSummary: string) => {
		const response = await fetch('/api/email-writer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ writer, emailSummary })
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(error);
			return;
		}

		if (response.body) {
			const stream = fromReadableStream(response.body);

			for await (const chunk of stream) {
				const content = chunk?.choices[0]?.delta?.content || '';
				content && setEmailReply(prev => prev + content);
			}
		}

		return emailReply;
	};

	const sendEmail = async (email: string) => {
		setInputEmail('');
		setIsLoading(true);

		setCompletedSteps({
			email: {
				content: email,
				status: 'complete'
			},
			sentiment: {
				content: 'Analyzing email sentiment...',
				status: 'current'
			},
			summary: {
				content: 'Preparing email summary...',
				status: 'current'
			}
		});

		const [sentimentAnalysis, emailSummary] = await Promise.all([
			analyzeSentiment(email),
			summarizeEmail(email)
		]);
		const { sentiment } = sentimentAnalysis;
		const { summary } = emailSummary;

		setCompletedSteps(prev => ({
			...prev,
			sentiment: {
				content: sentiment,
				status: 'complete'
			},
			summary: {
				content: summary,
				status: 'complete'
			},
			respond: {
				content: null,
				status: 'current'
			}
		}));

		// Make a decision if we should respond to email or not
		const { respond, category, byWhen, priority } =
			await shouldRespondToEmail(summary, sentiment);

		if (!respond) {
			setCompletedSteps(prev => ({
				...prev,
				respond: {
					content: { respond, category, byWhen, priority },
					status: 'complete'
				}
			}));

			setIsLoading(false);
			return;
		}

		setCompletedSteps(prev => ({
			...prev,
			respond: {
				content: { respond, category, byWhen, priority },
				status: 'complete'
			},
			tone: {
				content: 'Picking the correct email writer...',
				status: 'current'
			}
		}));

		// If yes, then pick email writer
		const { tone } = await pickEmailWriter(summary, sentiment);

		setCompletedSteps(prev => ({
			...prev,
			tone: {
				content: tone,
				status: 'complete'
			},
			emailReply: {
				content: 'Generating response...',
				status: 'current'
			}
		}));

		// Generate email reply
		const reply = await generateEmailReply(tone, summary);

		setCompletedSteps(prev => ({
			...prev,
			emailReply: {
				content: reply,
				status: 'complete'
			}
		}));

		setIsLoading(false);
	};

	const resetAgent = () => {
		setInputEmail('');
		setCompletedSteps({});
		setEmailReply('');
	};

	return {
		inputEmail,
		setInputEmail,
		isLoading,
		setIsLoading,
		completedSteps,
		setCompletedSteps,
		emailReply,
		setEmailReply,
		sendEmail,
		resetAgent
	};
};

export default useLangbase;
