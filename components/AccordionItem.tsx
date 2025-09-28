export const AccordionItem = ({ title, status, color, content, score, isOpen, onClick }: {
    title: string;
    status: string;
    color: string;
    content: string;
    score: number;
    isOpen: boolean;
    onClick: () => void;
}) => {
    const colorClasses = {
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        red: 'text-red-600 bg-red-50',
    };

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-gray-50"
            >
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {status}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800">{score.toFixed(0)}</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="p-5 pt-0 text-gray-600">
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
};