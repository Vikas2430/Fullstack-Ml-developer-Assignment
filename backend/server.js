const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });

const extractData = (patterns, text) => {
    const lines = text.split('\n');
    for (let line of lines) {
        for (let pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
    }
    return 'Not Found';
};

app.get('/', (req, res) => {
    res.send('PDF Extraction Service');
});

app.post('/extract', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.resolve(req.file.path);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);

        const text = pdfData.text || '';
        console.log('Full Extracted Text:', text);

        const extractedData = {
            name: extractData([
                /^Name\s*:\s*(.+)$/i
            ], text),
            phone: extractData([
                /Phone\s*:\s*(.+)/i
            ], text),
            address: extractData([
                /Address\s*:\s*(.+)/i
            ], text)
        };

        console.log('Extracted Data:', extractedData);

        res.json(extractedData);
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ 
            error: 'Failed to process the PDF',
            name: 'Not Found',
            phone: 'Not Found',
            address: 'Not Found'
        });
    } finally {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});