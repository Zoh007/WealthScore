export const AccordionItem = ({ title, status, color, content, isOpen, onClick }: any) => {
    const statusColor = color === 'green' ? 'text-green-500' : 'text-yellow-500';

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
            >
                <div className="flex items-center">
                    <span className="font-semibold text-gray-800">{title}</span>
                </div>
                <div className="flex items-center">
                    <span className={`font-semibold mr-4 ${statusColor}`}>{status}</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                <div className="p-5 pt-0 text-gray-600">
                    {content}
                </div>
            </div>
        </div>
    );
};