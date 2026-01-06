interface Color {
    [key: string]: string;
}

export const getDivisionColor = (division: string) => {
    const colors: Color = {
        hrd: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
        ga: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300',
        it: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
        dealing: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
        accounting: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300',
        finance: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
        'wakil pialang': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300',
        marketing: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300',
        'compliance director': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300',
        'operational director': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300',
        director: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
    };

    const normalizedDivision = division.toLowerCase();
    return colors[normalizedDivision] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
};
