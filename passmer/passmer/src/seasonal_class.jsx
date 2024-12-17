import { useEffect } from 'react';

const SeasonalClass = () => {
    useEffect(() => {
        const htmlTag = document.documentElement;
        const today = new Date();

        const isInRange = (start, end) => {
            const now = today;
            return now >= new Date(start) && now <= new Date(end);
        };

        const isExactDate = (month, day) => {
            return today.getMonth() === month && today.getDate() === day;
        };

        if (isInRange(`${today.getFullYear()}-10-20`, `${today.getFullYear()}-10-31`)) {
            htmlTag.classList.add('halloween');
        } else if (isExactDate(1, 14)) { // Month 1 is February (0-based)
            htmlTag.classList.add('valentines');
        } else if (isInRange(`${today.getFullYear()}-12-01`, `${today.getFullYear()}-12-26`)) {
            htmlTag.classList.add('xmas');
        } else if (isInRange(`${today.getFullYear()}-12-27`, `${today.getFullYear() + 1}-01-02`)) {
            htmlTag.classList.add('new-year');
        } else if (isInRange(`${today.getFullYear()}-03-29`, `${today.getFullYear()}-05-19`)) {
            htmlTag.classList.add('easter');
        }

        return () => {
            htmlTag.classList.remove('halloween', 'valentines', 'xmas', 'new-year', 'easter');
        };
    }, []);

    return null;
};

export default SeasonalClass;
