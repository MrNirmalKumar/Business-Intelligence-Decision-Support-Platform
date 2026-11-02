const path = require('path');
const xlsx = require('xlsx');

const filePath = path.join(__dirname, 'uploads', '1790567305477-378874651.xls');
try {
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { cellDates: true });
    
    for(let i=0; i<3; i++) {
        let rawDate = rows[i]['Order Date'];
        let parsedDate;
        if (rawDate instanceof Date) {
            parsedDate = rawDate;
        } else if (typeof rawDate === 'number') {
            if (rawDate > 1000 && rawDate < 100000) {
                parsedDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
            } else {
                parsedDate = new Date(rawDate);
            }
        } else if (typeof rawDate === 'string' && !isNaN(Number(rawDate))) {
            const numVal = Number(rawDate);
            if (numVal > 1000 && numVal < 100000) {
                parsedDate = new Date(Math.round((numVal - 25569) * 86400 * 1000));
            } else {
                parsedDate = new Date(numVal);
            }
        } else if (rawDate) {
            parsedDate = new Date(rawDate);
        } else {
            parsedDate = new Date();
        }
        
        console.log(`Row ${i} Raw Date:`, rawDate, typeof rawDate, "Parsed:", parsedDate);
    }
} catch (e) {
    console.error(e);
}
